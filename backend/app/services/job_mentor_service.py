"""Conversational job mentor — context search from chat + resume, not rigid filters."""

from __future__ import annotations

from app.schemas.job_discovery import JobDiscoveryRequest
from app.schemas.job_mentor import (
    InferredSearchIntent,
    JobMentorChatRequest,
    JobMentorChatResponse,
    ProfileUpdates,
)
from app.services.ai_client import GeminiClient, gemini_client
from app.services.job_discovery_service import JobDiscoveryService

SYSTEM = """You are a trusted job search mentor for software engineers in India (often 12–30 LPA).
You talk like a sharp recruiter friend — warm, direct, human. NEVER sound like a generic AI bot.

Rules:
- No "As an AI", no bullet dumps unless the candidate asks for a list.
- Reference their resume naturally when provided ("You've got solid React on your CV…").
- Read between the lines: "something remote with good pay" → remote, 15+ LPA.
- Honest but encouraging. One clarifying question only if truly stuck.
- Keep `reply` under ~120 words — conversational, not a report.

Also infer search criteria AND profile facts from conversation + resume text.
Return JSON with exactly these keys:
{
  "reply": "conversational reply, under ~120 words",
  "search_summary": "one casual sentence of what you'll look for",
  "target_role": "string",
  "min_salary_lpa": number or null,
  "max_salary_lpa": number or null,
  "preferred_locations": ["city or Remote"],
  "work_mode": "Any|Remote|Hybrid|Onsite",
  "sources": [] or portal names,
  "skills_emphasis": ["skills from conversation"],
  "keywords": ["job search keywords, max 8"],
  "resume_insight": "one line about resume fit or null",
  "profile_updates": {
    "target_role": "string or null if unchanged",
    "skills": ["merge new skills mentioned"],
    "years_experience": number or null,
    "min_salary_lpa": number or null,
    "max_salary_lpa": number or null,
    "preferred_locations": [],
    "work_mode": "string or null",
    "resume_snippet": "if user pasted resume text in chat, extract key excerpt max 500 chars else null"
  }
}

If messages is empty, return reply asking what they want — do NOT assume preferences."""


class JobMentorService:
    def __init__(
        self,
        client: GeminiClient | None = None,
        discovery: JobDiscoveryService | None = None,
    ) -> None:
        self.client = client or gemini_client
        self.discovery = discovery or JobDiscoveryService()

    def chat(self, request: JobMentorChatRequest) -> JobMentorChatResponse:
        has_resume = len(request.resume_excerpt.strip()) >= 40

        if not request.messages:
            return JobMentorChatResponse(
                reply=(
                    "What kind of role are you aiming for? Tell me salary, location, stack — "
                    "or paste a resume snippet and I'll read it."
                ),
                search_summary="",
                inferred_intent=InferredSearchIntent(),
                jobs=[],
                total_matches=0,
                resume_used=has_resume,
            )

        intent, reply, resume_insight, keywords, profile_updates = self._infer_intent(
            request, has_resume
        )
        discovery_req = self._to_discovery(request, intent)
        discovery = self.discovery.discover(discovery_req)

        return JobMentorChatResponse(
            reply=reply,
            search_summary=intent.natural_summary or self._default_summary(intent),
            inferred_intent=intent,
            jobs=discovery.items,
            total_matches=discovery.total,
            resume_used=has_resume,
            resume_insight=resume_insight,
            keywords=keywords,
            profile_updates=profile_updates,
        )

    def _infer_intent(
        self, request: JobMentorChatRequest, has_resume: bool
    ) -> tuple[InferredSearchIntent, str, str | None, list[str], ProfileUpdates | None]:
        if not request.messages:
            return (
                InferredSearchIntent(),
                "What kind of role are you aiming for? Tell me salary, location, stack — or paste a resume snippet.",
                None,
                [],
                None,
            )

        if not self.client.enabled:
            intent, reply, insight = self._fallback_intent(request, has_resume)
            return intent, reply, insight, self._extract_keywords(request), None

        history = request.messages[-10:]
        last_user = ""
        for msg in reversed(history):
            if msg.role == "user":
                last_user = msg.content
                break

        transcript = "\n".join(
            f"{'Candidate' if m.role == 'user' else 'Mentor'}: {m.content}"
            for m in history
        )

        prompt = f"""[Profile]
Name: {request.display_name or 'Candidate'}
Level: {request.current_level}
Target role: {request.target_role}
Skills: {', '.join(request.skills) or 'not set'}
Experience: {request.years_experience} years
Salary band: {request.min_salary_lpa}–{request.max_salary_lpa} LPA
Locations: {', '.join(request.preferred_locations) or 'flexible'}
Work mode pref: {request.work_mode}
Portals enabled: {', '.join(request.sources) or 'all'}
Resume linked: {'yes — ' + request.resume_name if has_resume else 'no'}
Resume excerpt:
{(request.resume_excerpt or '')[:3500] or 'none'}

[Chat]
{transcript or '(first message — greet and ask what kind of move they want)'}

Latest user message: {last_user or '(start conversation)'}
"""

        try:
            data = self.client.generate_json(SYSTEM, prompt, temperature=0.55, max_output_tokens=1000)
        except Exception:
            intent, reply, insight = self._fallback_intent(request, has_resume)
            return intent, reply, insight, self._extract_keywords(request), None

        reply = str(data.get("reply") or "").strip()
        if not reply:
            reply = self._fallback_reply(request, has_resume)

        intent = InferredSearchIntent(
            target_role=str(data.get("target_role") or request.target_role),
            min_salary_lpa=self._num(data.get("min_salary_lpa"), request.min_salary_lpa),
            max_salary_lpa=self._num(data.get("max_salary_lpa"), request.max_salary_lpa),
            preferred_locations=data.get("preferred_locations") or request.preferred_locations,
            work_mode=str(data.get("work_mode") or request.work_mode),
            sources=data.get("sources") or request.sources,
            skills_emphasis=[str(s) for s in (data.get("skills_emphasis") or [])],
            natural_summary=str(data.get("search_summary") or ""),
        )
        resume_insight = data.get("resume_insight")
        if resume_insight:
            resume_insight = str(resume_insight).strip()

        keywords = [str(k) for k in (data.get("keywords") or [])][:8]
        profile_updates = self._parse_profile_updates(data.get("profile_updates"))

        return intent, reply, resume_insight, keywords, profile_updates

    @staticmethod
    def _parse_profile_updates(raw: object | None) -> ProfileUpdates | None:
        if not raw or not isinstance(raw, dict):
            return None
        skills = [str(s) for s in (raw.get("skills") or []) if str(s).strip()]
        snippet = raw.get("resume_snippet")
        has_any = (
            skills
            or raw.get("target_role")
            or raw.get("years_experience") is not None
            or raw.get("min_salary_lpa") is not None
            or raw.get("work_mode")
            or snippet
        )
        if not has_any:
            return None
        return ProfileUpdates(
            target_role=str(raw["target_role"]) if raw.get("target_role") else None,
            skills=skills,
            years_experience=int(raw["years_experience"])
            if raw.get("years_experience") is not None
            else None,
            min_salary_lpa=float(raw["min_salary_lpa"])
            if raw.get("min_salary_lpa") is not None
            else None,
            max_salary_lpa=float(raw["max_salary_lpa"])
            if raw.get("max_salary_lpa") is not None
            else None,
            preferred_locations=[str(l) for l in (raw.get("preferred_locations") or [])],
            work_mode=str(raw["work_mode"]) if raw.get("work_mode") else None,
            resume_snippet=str(snippet)[:500] if snippet else None,
        )

    @staticmethod
    def _extract_keywords(request: JobMentorChatRequest) -> list[str]:
        words: list[str] = []
        for msg in request.messages:
            if msg.role == "user":
                words.extend(msg.content.lower().split())
        stop = {"i", "a", "the", "and", "for", "want", "need", "looking", "in", "at", "my"}
        return list(dict.fromkeys(w for w in words if len(w) > 2 and w not in stop))[:8]

    def _fallback_intent(
        self, request: JobMentorChatRequest, has_resume: bool
    ) -> tuple[InferredSearchIntent, str, str | None, list[str], ProfileUpdates | None]:
        last = ""
        for msg in reversed(request.messages):
            if msg.role == "user":
                last = msg.content.lower()
                break

        intent = InferredSearchIntent(
            target_role=request.target_role,
            min_salary_lpa=request.min_salary_lpa,
            max_salary_lpa=request.max_salary_lpa,
            preferred_locations=request.preferred_locations,
            work_mode=request.work_mode,
            sources=request.sources,
        )

        if "remote" in last:
            intent.work_mode = "Remote"
            intent.natural_summary = "remote-friendly roles in your band"
        if "hybrid" in last:
            intent.work_mode = "Hybrid"
        if "bangalore" in last or "bengaluru" in last:
            intent.preferred_locations = ["Bangalore"]
        if "15" in last or "lpa" in last:
            intent.min_salary_lpa = max(request.min_salary_lpa, 15)

        reply = self._fallback_reply(request, has_resume)
        insight = (
            "I've got your resume on file — I'll weight matches to what you've actually shipped."
            if has_resume
            else "Link your resume in profile so I can match on your real experience, not just keywords."
        )
        intent.natural_summary = intent.natural_summary or self._default_summary(intent)
        return intent, reply, insight, self._extract_keywords(request), None

    def _fallback_reply(self, request: JobMentorChatRequest, has_resume: bool) -> str:
        name = request.display_name.split()[0] if request.display_name else "Hey"
        resume_bit = (
            " I'm reading your resume too — that'll sharpen what I surface."
            if has_resume
            else " Upload your resume when you can; it makes a huge difference vs plain filters."
        )
        return (
            f"{name}, I'm lining up roles around {request.target_role} "
            f"in the {request.min_salary_lpa:.0f}–{request.max_salary_lpa:.0f} LPA range.{resume_bit} "
            "Tell me what matters most right now — remote, stack, company type?"
        )

    def _to_discovery(
        self, request: JobMentorChatRequest, intent: InferredSearchIntent
    ) -> JobDiscoveryRequest:
        skills = list(dict.fromkeys(request.skills + intent.skills_emphasis))
        return JobDiscoveryRequest(
            target_role=intent.target_role or request.target_role,
            user_skills=skills,
            years_experience=request.years_experience,
            min_salary_lpa=intent.min_salary_lpa or request.min_salary_lpa,
            max_salary_lpa=intent.max_salary_lpa or request.max_salary_lpa,
            preferred_locations=intent.preferred_locations or request.preferred_locations,
            work_mode=intent.work_mode or request.work_mode,
            sources=intent.sources or request.sources,
            limit=request.limit,
            resume_text=request.resume_excerpt,
        )

    @staticmethod
    def _num(value: object | None, default: float) -> float:
        try:
            if value is None:
                return default
            return float(value)
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _default_summary(intent: InferredSearchIntent) -> str:
        parts = [intent.target_role or "roles"]
        if intent.work_mode and intent.work_mode != "Any":
            parts.append(intent.work_mode.lower())
        if intent.min_salary_lpa:
            parts.append(f"{intent.min_salary_lpa:.0f}+ LPA")
        if intent.preferred_locations:
            parts.append(", ".join(intent.preferred_locations[:2]))
        return " · ".join(parts)
