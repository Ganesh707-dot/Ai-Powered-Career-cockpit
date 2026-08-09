"""JD Intelligence powered by Google Gemini (free tier)."""

from __future__ import annotations

from app.schemas.jd_analysis import JDAnalysisRequest, JDAnalysisResponse
from app.services.ai_client import GeminiClient, gemini_client

SYSTEM_PROMPT = """Expert tech recruiter. Return ONLY compact valid JSON. No fluff.
Never invent candidate skills. Score match ONLY from provided candidate profile."""


class JDAnalysisService:
    def __init__(self, client: GeminiClient | None = None) -> None:
        self.client = client or gemini_client

    def analyze(self, request: JDAnalysisRequest) -> JDAnalysisResponse:
        skills = [s.strip() for s in request.user_skills if s and s.strip()]
        resume = (request.resume_text or "").strip()
        has_profile = bool(skills) or len(resume) >= 40

        jd = request.job_description[:3500]
        resume_excerpt = resume[:2500]

        if not has_profile:
            # Still extract JD structure, but do NOT fake a match score
            prompt = f"""Extract skills from this JD only. Candidate profile is MISSING.

JD:
{jd}

JSON keys: company,role,experience,technical_skills,soft_skills,databases,cloud,devops,
responsibilities,keywords,match_score,strength_areas,missing_skills,
resume_suggestions,interview_focus_topics,learning_recommendations

Rules:
- match_score MUST be null
- strength_areas MUST be []
- missing_skills = top JD technical skills (what candidate would need)
- resume_suggestions = ["Add your skills or upload a resume to get a real match score"]
- learning_recommendations based on JD skills only
- arrays max 5
"""
            data = self.client.generate_json(
                SYSTEM_PROMPT, prompt, temperature=0.2, max_output_tokens=700
            )
            return self._to_response(
                data,
                match_available=False,
                match_note="No candidate profile provided. Add skills or upload/select a resume for a realistic match score.",
                force_null_score=True,
            )

        skills_line = ", ".join(skills) if skills else "(infer skills from resume text)"
        yoe = request.years_experience if request.years_experience is not None else "unknown"
        target = request.target_role or "not specified"
        prompt = f"""Compare candidate profile vs JD. Be realistic (0-100).

Candidate skills: {skills_line}
Years experience: {yoe}
Target role: {target}
Resume excerpt:
{resume_excerpt or "(none)"}

JD:
{jd}

JSON keys: company,role,experience,technical_skills,soft_skills,databases,cloud,devops,
responsibilities,keywords,match_score,strength_areas,missing_skills,
resume_suggestions,interview_focus_topics,learning_recommendations

Rules:
- match_score MUST be a number 0-100 based ONLY on overlap between candidate profile and JD
- If resume/skills are thin, score conservatively
- strength_areas = skills present in BOTH
- missing_skills = important JD skills absent from candidate
- arrays max 5, short strings
"""
        data = self.client.generate_json(
            SYSTEM_PROMPT, prompt, temperature=0.2, max_output_tokens=800
        )
        return self._to_response(
            data,
            match_available=True,
            match_note="Match score compares your provided skills/resume against this JD.",
            force_null_score=False,
        )

    def _to_response(
        self,
        data: dict,
        *,
        match_available: bool,
        match_note: str,
        force_null_score: bool,
    ) -> JDAnalysisResponse:
        score = None if force_null_score else _as_float_or_none(data.get("match_score"))
        return JDAnalysisResponse(
            company=_as_opt_str(data.get("company")),
            role=_as_opt_str(data.get("role")),
            experience=_as_opt_str(data.get("experience")),
            technical_skills=_as_str_list(data.get("technical_skills")),
            soft_skills=_as_str_list(data.get("soft_skills")),
            databases=_as_str_list(data.get("databases")),
            cloud=_as_str_list(data.get("cloud")),
            devops=_as_str_list(data.get("devops")),
            responsibilities=_as_str_list(data.get("responsibilities")),
            keywords=_as_str_list(data.get("keywords")),
            match_score=score,
            match_available=match_available and score is not None,
            match_note=match_note,
            strength_areas=[] if force_null_score else _as_str_list(data.get("strength_areas")),
            missing_skills=_as_str_list(data.get("missing_skills")),
            resume_suggestions=_as_str_list(data.get("resume_suggestions")),
            interview_focus_topics=_as_str_list(data.get("interview_focus_topics")),
            learning_recommendations=_as_str_list(data.get("learning_recommendations")),
        )


def _as_str_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()][:8]


def _as_opt_str(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _as_float_or_none(value: object) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return max(0.0, min(100.0, float(value)))
    if isinstance(value, str):
        cleaned = value.replace("%", "").strip().lower()
        if cleaned in {"", "null", "none", "n/a"}:
            return None
        try:
            return max(0.0, min(100.0, float(cleaned)))
        except ValueError:
            return None
    return None
