"""LLM provider contract — swap Gemini ↔ OpenAI without touching product services."""

from __future__ import annotations

from typing import Any, Iterator, Protocol


class LLMProvider(Protocol):
    @property
    def enabled(self) -> bool: ...

    @property
    def provider_name(self) -> str: ...

    @property
    def model_name(self) -> str: ...

    def generate_json(
        self,
        system_instruction: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_output_tokens: int = 1024,
    ) -> dict[str, Any]: ...

    def generate_chat(
        self,
        system_instruction: str,
        messages: list[dict[str, str]],
        temperature: float = 0.5,
        max_output_tokens: int = 550,
    ) -> str: ...

    def stream_chat(
        self,
        system_instruction: str,
        messages: list[dict[str, str]],
        temperature: float = 0.5,
        max_output_tokens: int = 550,
    ) -> Iterator[str]: ...
