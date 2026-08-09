"""Gemini API client — retries, cache, fast path for free-tier limits."""

from __future__ import annotations

import hashlib
import json
import logging
import re
import time
from typing import Any, Iterator

import httpx

from app.config import settings
from app.services.llm.errors import AIConfigurationError, AIProviderError

logger = logging.getLogger(__name__)

__all__ = ["AIConfigurationError", "AIProviderError", "GeminiClient", "gemini_client"]

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "{model}:generateContent"
)
GEMINI_STREAM_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "{model}:streamGenerateContent"
)

# Prefer lite/latest aliases that usually have better free-tier headroom.
MODEL_FALLBACKS = [
    "gemini-2.0-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-2.0-flash",
]


class GeminiClient:
    """Shared HTTP client for Google Gemini generateContent."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        timeout: float = 25.0,
    ) -> None:
        self.api_key = (api_key if api_key is not None else settings.gemini_api_key).strip()
        self.model = model or settings.gemini_model
        self.timeout = timeout
        self._client = httpx.Client(
            timeout=httpx.Timeout(timeout, connect=6.0),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
        )
        self._cache: dict[str, tuple[float, str]] = {}
        self._cache_ttl = 180.0  # 3 minutes — speed + quota savings
        self._active_model = self.model

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    @property
    def provider_name(self) -> str:
        return "gemini"

    @property
    def model_name(self) -> str:
        return self._active_model or self.model

    def generate_json(
        self,
        system_instruction: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_output_tokens: int = 1024,
    ) -> dict[str, Any]:
        text = self.generate_text(
            system_instruction,
            user_prompt,
            temperature=temperature,
            json_mode=True,
            max_output_tokens=max_output_tokens,
        )
        return self._parse_json(text)

    def generate_plain(
        self,
        system_instruction: str,
        user_prompt: str,
        temperature: float = 0.5,
        max_output_tokens: int = 700,
    ) -> str:
        return self.generate_text(
            system_instruction,
            user_prompt,
            temperature=temperature,
            json_mode=False,
            max_output_tokens=max_output_tokens,
        )

    def generate_chat(
        self,
        system_instruction: str,
        messages: list[dict[str, str]],
        temperature: float = 0.5,
        max_output_tokens: int = 550,
    ) -> str:
        if not self.enabled:
            raise AIConfigurationError(
                "GEMINI_API_KEY is not set. Get a free key at "
                "https://aistudio.google.com/apikey and set GEMINI_API_KEY."
            )

        contents = []
        for msg in messages:
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})

        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_output_tokens,
            },
        }
        return self._request_with_retries(payload, stream=False)

    def stream_chat(
        self,
        system_instruction: str,
        messages: list[dict[str, str]],
        temperature: float = 0.5,
        max_output_tokens: int = 550,
    ) -> Iterator[str]:
        """Yield text chunks. On stream failure, yields nothing (caller may fallback once)."""
        if not self.enabled:
            raise AIConfigurationError(
                "GEMINI_API_KEY is not set. Get a free key at "
                "https://aistudio.google.com/apikey and set GEMINI_API_KEY."
            )

        contents = []
        for msg in messages:
            role = "user" if msg.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.get("content", "")}]})

        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_output_tokens,
            },
        }

        models = self._model_chain()
        last_error: Exception | None = None
        for model in models:
            url = GEMINI_STREAM_URL.format(model=model)
            try:
                with self._client.stream(
                    "POST",
                    url,
                    params={"alt": "sse"},
                    json=payload,
                    headers=self._headers(),
                ) as response:
                    if response.status_code == 429:
                        wait = self._retry_seconds(response.text)
                        last_error = AIProviderError(
                            f"Rate limited. Retry in ~{int(wait)}s (free-tier quota)."
                        )
                        time.sleep(min(wait, 8))
                        continue
                    if response.status_code >= 400:
                        detail = response.read().decode("utf-8", errors="ignore")[:300]
                        last_error = AIProviderError(
                            f"Gemini API error ({response.status_code}): {detail}"
                        )
                        if response.status_code in (404, 400):
                            continue
                        raise last_error
                    self._active_model = model
                    for line in response.iter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        raw = line[6:].strip()
                        if not raw or raw == "[DONE]":
                            continue
                        try:
                            data = json.loads(raw)
                            parts = data["candidates"][0]["content"]["parts"]
                            for part in parts:
                                text = part.get("text")
                                if text:
                                    yield text
                        except (KeyError, IndexError, TypeError, json.JSONDecodeError):
                            continue
                    return
            except httpx.HTTPError as exc:
                last_error = AIProviderError(f"Gemini network error: {exc}")
                continue
        raise last_error or AIProviderError("Gemini stream failed")

    def generate_text(
        self,
        system_instruction: str,
        user_prompt: str,
        temperature: float = 0.4,
        json_mode: bool = True,
        max_output_tokens: int = 1024,
    ) -> str:
        if not self.enabled:
            raise AIConfigurationError(
                "GEMINI_API_KEY is not set. Get a free key at "
                "https://aistudio.google.com/apikey and set GEMINI_API_KEY."
            )

        cache_key = self._cache_key(
            system_instruction, user_prompt, temperature, json_mode, max_output_tokens
        )
        cached = self._cache_get(cache_key)
        if cached is not None:
            return cached

        generation_config: dict[str, Any] = {
            "temperature": temperature,
            "maxOutputTokens": max_output_tokens,
        }
        if json_mode:
            generation_config["responseMimeType"] = "application/json"

        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
            "generationConfig": generation_config,
        }
        text = self._request_with_retries(payload, stream=False)
        self._cache_set(cache_key, text)
        return text

    def _request_with_retries(self, payload: dict[str, Any], stream: bool = False) -> str:
        models = self._model_chain()
        last_error: Exception | None = None

        for attempt in range(3):
            for model in models:
                url = GEMINI_URL.format(model=model)
                try:
                    response = self._client.post(
                        url,
                        json=payload,
                        headers=self._headers(),
                    )
                except httpx.HTTPError as exc:
                    last_error = AIProviderError(f"Gemini network error: {exc}")
                    continue

                if response.status_code == 429:
                    wait = self._retry_seconds(response.text)
                    last_error = AIProviderError(
                        f"Rate limited on free tier. Please wait ~{int(wait)}s and try again."
                    )
                    # brief backoff then try next model / retry
                    time.sleep(min(wait, 6 + attempt * 2))
                    continue

                if response.status_code >= 400:
                    detail = response.text[:400]
                    last_error = AIProviderError(
                        f"Gemini API error ({response.status_code}): {detail}"
                    )
                    # try next model on not-found / unsupported
                    if response.status_code in (404, 400):
                        continue
                    if attempt < 2:
                        time.sleep(1 + attempt)
                        continue
                    raise last_error

                data = response.json()
                try:
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    self._active_model = model
                    return text
                except (KeyError, IndexError, TypeError) as exc:
                    last_error = AIProviderError(
                        f"Unexpected Gemini response shape: {exc}"
                    )
                    continue

        raise last_error or AIProviderError("Gemini request failed after retries")

    def _headers(self) -> dict[str, str]:
        # Prefer header so keys are less likely to appear in URL access logs
        return {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key,
        }

    def _model_chain(self) -> list[str]:
        ordered = [self._active_model, self.model, *MODEL_FALLBACKS]
        seen: set[str] = set()
        out: list[str] = []
        for m in ordered:
            if m and m not in seen:
                seen.add(m)
                out.append(m)
        return out

    @staticmethod
    def _retry_seconds(body: str) -> float:
        match = re.search(r"retry in ([0-9.]+)s", body, re.I)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass
        return 8.0

    def _cache_key(self, *parts: object) -> str:
        raw = json.dumps(parts, sort_keys=True, default=str)
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def _cache_get(self, key: str) -> str | None:
        item = self._cache.get(key)
        if not item:
            return None
        ts, value = item
        if time.time() - ts > self._cache_ttl:
            self._cache.pop(key, None)
            return None
        return value

    def _cache_set(self, key: str, value: str) -> None:
        if len(self._cache) > 128:
            # drop oldest
            oldest = min(self._cache.items(), key=lambda kv: kv[1][0])[0]
            self._cache.pop(oldest, None)
        self._cache[key] = (time.time(), value)

    @staticmethod
    def _parse_json(text: str) -> dict[str, Any]:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if not match:
                raise AIProviderError("Gemini returned non-JSON content") from exc
            parsed = json.loads(match.group(0))
        if not isinstance(parsed, dict):
            raise AIProviderError("Gemini JSON root must be an object")
        return parsed


class _LLMProxy:
    """Lazy provider proxy — services keep importing `gemini_client`."""

    _impl = None

    def _get(self):
        if self._impl is None:
            from app.services.llm.factory import create_llm

            self._impl = create_llm()
        return self._impl

    def __getattr__(self, item: str):
        return getattr(self._get(), item)


gemini_client = _LLMProxy()
