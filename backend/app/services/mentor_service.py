"""Conversational AI career staff — guides candidates level → target role."""

from __future__ import annotations

from typing import Iterator

from app.schemas.mentor import MentorChatRequest, MentorChatResponse, MentorMessage
from app.services.ai_client import GeminiClient, gemini_client

SYSTEM = """You are CareerPilot Staff — a sharp, encouraging career mentor for software engineers
targeting product/SaaS roles (often 12–25 LPA India / equivalent remote).

Style:
- Conversational, specific, actionable. Short paragraphs.
- Diagnose current level honestly, then coach toward the target role.
- Ask at most 1 clarifying question when needed.
- Give concrete next steps (study topics, projects, resume bullets, interview drills).
- Never invent the candidate's experience; build on what they share.

If they ask for a learning plan, outline week-by-week milestones.
Keep replies under ~180 words unless they ask for depth."""


class MentorService:
    def __init__(self, client: GeminiClient | None = None) -> None:
        self.client = client or gemini_client

    def _context_prefix(self, request: MentorChatRequest) -> str:
        return (
            f"[Profile]\n"
            f"Current level: {request.current_level or 'unknown'}\n"
            f"Target role: {request.target_role or 'not set'}\n"
            f"Skills: {', '.join(request.skills) or 'not set'}\n"
            f"Years experience: {request.years_experience}\n"
            f"Resume snippet: {(request.resume_excerpt or '')[:1200] or 'none'}\n"
        )

    def chat(self, request: MentorChatRequest) -> MentorChatResponse:
        messages = self._build_messages(request)
        reply = self.client.generate_chat(
            SYSTEM,
            messages,
            temperature=0.5,
            max_output_tokens=650,
        )
        meta = self._quick_meta(request, reply)
        return MentorChatResponse(
            reply=reply.strip(),
            level_assessment=meta.get("level_assessment"),
            next_actions=meta.get("next_actions") or [],
            suggested_topics=meta.get("suggested_topics") or [],
        )

    def stream_reply(self, request: MentorChatRequest) -> Iterator[str]:
        messages = self._build_messages(request)
        yield from self.client.stream_chat(
            SYSTEM,
            messages,
            temperature=0.5,
            max_output_tokens=650,
        )

    def _build_messages(self, request: MentorChatRequest) -> list[dict[str, str]]:
        history = request.messages[-12:]  # keep recent turns for speed
        messages: list[dict[str, str]] = []
        # Inject profile once as first user context
        if history:
            first = history[0]
            primed = f"{self._context_prefix(request)}\n[User]\n{first.content}"
            messages.append({"role": "user", "content": primed})
            for msg in history[1:]:
                messages.append({"role": msg.role, "content": msg.content})
        else:
            messages.append(
                {
                    "role": "user",
                    "content": (
                        f"{self._context_prefix(request)}\n"
                        "Say hello briefly and ask what role they want and where they feel weakest."
                    ),
                }
            )
        return messages

    def _quick_meta(self, request: MentorChatRequest, reply: str) -> dict:
        """Lightweight structured follow-ups without a second slow Gemini call."""
        level = request.current_level or "assessing"
        actions = []
        topics = []
        # Pull simple bullets if model listed them
        for line in reply.splitlines():
            cleaned = line.strip(" -*\t")
            if cleaned.lower().startswith(("1.", "2.", "3.", "next:", "week")):
                actions.append(cleaned[:160])
            if any(
                k in cleaned.lower()
                for k in ("learn", "study", "practice", "build", "revise")
            ):
                topics.append(cleaned[:120])
        return {
            "level_assessment": level,
            "next_actions": actions[:4],
            "suggested_topics": topics[:4],
        }

    def opening_message(self, request: MentorChatRequest) -> MentorChatResponse:
        if not request.messages:
            request.messages = [
                MentorMessage(
                    role="user",
                    content=(
                        "I want guided coaching from my current level to my target role. "
                        "Start by assessing me and propose a path."
                    ),
                )
            ]
        return self.chat(request)
