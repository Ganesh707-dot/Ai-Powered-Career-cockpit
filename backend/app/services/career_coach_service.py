"""Resume coaching + career insights powered by Gemini."""

from __future__ import annotations

from app.schemas.career_coach import (
    CareerInsightsRequest,
    CareerInsightsResponse,
    ResumeCoachRequest,
    ResumeCoachResponse,
)
from app.services.ai_client import GeminiClient, gemini_client

RESUME_SYSTEM = """You are CareerPilot AI, a senior technical resume coach for
software engineers targeting 12-25 LPA product/SaaS roles in India and remote global roles.
Be direct, specific, and ATS-aware. Return ONLY valid JSON."""

INSIGHTS_SYSTEM = """You are CareerPilot AI, a career strategist for software engineers.
Turn application analytics into actionable coaching. Return ONLY valid JSON."""


class CareerCoachService:
    def __init__(self, client: GeminiClient | None = None) -> None:
        self.client = client or gemini_client

    def coach_resume(self, request: ResumeCoachRequest) -> ResumeCoachResponse:
        jd = request.job_description.strip() or "Not provided — optimize for the target role generally."
        prompt = f"""Coach this resume for the target role.

Target role: {request.target_role}
Years of experience: {request.years_experience}
Job description (optional):
---
{jd}
---
Resume text:
---
{request.resume_text}
---

Return JSON:
{{
  "summary": string,
  "strengths": string[],
  "gaps": string[],
  "bullet_rewrites": string[],
  "keywords_to_add": string[],
  "ats_tips": string[]
}}

bullet_rewrites should be improved achievement bullets with metrics where plausible.
"""
        data = self.client.generate_json(RESUME_SYSTEM, prompt, temperature=0.45)
        return ResumeCoachResponse(
            summary=str(data.get("summary") or "").strip(),
            strengths=_str_list(data.get("strengths")),
            gaps=_str_list(data.get("gaps")),
            bullet_rewrites=_str_list(data.get("bullet_rewrites")),
            keywords_to_add=_str_list(data.get("keywords_to_add")),
            ats_tips=_str_list(data.get("ats_tips")),
        )

    def career_insights(self, request: CareerInsightsRequest) -> CareerInsightsResponse:
        prompt = f"""Analyze this job-search snapshot and coach the candidate.

Target role: {request.target_role}
Candidate skills: {", ".join(request.user_skills) or "not provided"}
Companies applied: {", ".join(request.companies[:20]) or "none yet"}
Top skills appearing in JDs: {", ".join(request.top_skills_from_jobs[:20]) or "none"}
Total applications: {request.total_applications}
Interview conversion rate: {request.interview_conversion_rate}%
Offer rate: {request.offer_rate}%

Return JSON:
{{
  "headline": string,
  "insights": string[],
  "next_actions": string[],
  "skill_gaps": string[],
  "learning_plan": string[]
}}
"""
        data = self.client.generate_json(INSIGHTS_SYSTEM, prompt, temperature=0.45)
        return CareerInsightsResponse(
            headline=str(data.get("headline") or "").strip(),
            insights=_str_list(data.get("insights")),
            next_actions=_str_list(data.get("next_actions")),
            skill_gaps=_str_list(data.get("skill_gaps")),
            learning_plan=_str_list(data.get("learning_plan")),
        )


def _str_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]
