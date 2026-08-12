"""OpenAI-compatible provider (swap-ready for GPT-4.1 / GPT-5 family)."""

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


class OpenAIProvider:
    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        base_url: str | None = None,
        timeout: float = 25.0,
    ) -> None:
        self.api_key = (api_key if api_key is not None else settings.openai_api_key).strip()
        self.model = model or settings.openai_model
        self.base_url = (base_url or settings.openai_base_url).rstrip("/")
        self._client = httpx.Client(timeout=httpx.Timeout(timeout, connect=6.0))
        self._cache: dict[str, tuple[float, str]] = {}
        self._cache_ttl = 180.0

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    @property
    def provider_name(self) -> str:
        if "groq.com" in self.base_url:
            return "groq"
        return "openai"

    @property
    def model_name(self) -> str:
        return self.model

    def generate_json(
        self,
        system_instruction: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_output_tokens: int = 1024,
    ) -> dict[str, Any]:
        text = self._chat(
            [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=max_output_tokens,
            json_mode=True,
        )
        return self._parse_json(text)

    def generate_chat(
        self,
        system_instruction: str,
        messages: list[dict[str, str]],
        temperature: float = 0.5,
        max_output_tokens: int = 550,
    ) -> str:
        mapped = [{"role": "system", "content": system_instruction}]
        for msg in messages:
            role = "assistant" if msg.get("role") in {"assistant", "model"} else "user"
            mapped.append({"role": role, "content": msg.get("content", "")})
        return self._chat(
            mapped,
            temperature=temperature,
            max_tokens=max_output_tokens,
            json_mode=False,
        )

    def stream_chat(
        self,
        system_instruction: str,
        messages: list[dict[str, str]],
        temperature: float = 0.5,
        max_output_tokens: int = 550,
    ) -> Iterator[str]:
        # Non-stream fallback yields once — keeps interface stable
        yield self.generate_chat(
            system_instruction, messages, temperature, max_output_tokens
        )

    def _chat(
        self,
        messages: list[dict[str, str]],
        temperature: float,
        max_tokens: int,
        json_mode: bool,
    ) -> str:
        if not self.enabled:
            raise AIConfigurationError(
                "OPENAI_API_KEY is not set. Set AI_PROVIDER=openai and OPENAI_API_KEY."
            )

        cache_key = hashlib.sha256(
            json.dumps([messages, temperature, max_tokens, json_mode], sort_keys=True).encode()
        ).hexdigest()
        cached = self._cache.get(cache_key)
        if cached and time.time() - cached[0] < self._cache_ttl:
            return cached[1]

        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            response = self._client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
        except httpx.HTTPError as exc:
            raise AIProviderError(f"OpenAI network error: {exc}") from exc

        if response.status_code >= 400:
            raise AIProviderError(
                f"OpenAI API error ({response.status_code}): {response.text[:400]}"
            )

        data = response.json()
        try:
            text = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise AIProviderError("Unexpected OpenAI response shape") from exc

        self._cache[cache_key] = (time.time(), text)
        return text

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
                raise AIProviderError("OpenAI returned non-JSON content") from exc
            parsed = json.loads(match.group(0))
        if not isinstance(parsed, dict):
            raise AIProviderError("OpenAI JSON root must be an object")
        return parsed
