"""Create the active LLM provider from settings (gemini | openai)."""

from __future__ import annotations

from functools import lru_cache

from app.config import settings


@lru_cache(maxsize=1)
def create_llm():
    provider = (settings.ai_provider or "gemini").strip().lower()
    if provider == "openai":
        from app.services.llm.openai_provider import OpenAIProvider

        return OpenAIProvider()

    from app.services.ai_client import GeminiClient

    return GeminiClient()


def reset_llm_cache() -> None:
    create_llm.cache_clear()
