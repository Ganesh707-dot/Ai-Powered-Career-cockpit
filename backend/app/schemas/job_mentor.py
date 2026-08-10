from pydantic import BaseModel, Field

from app.schemas.job_discovery import DiscoveredJob
from app.schemas.mentor import MentorMessage


class InferredSearchIntent(BaseModel):
    target_role: str = ""
    min_salary_lpa: float | None = None
    max_salary_lpa: float | None = None
    preferred_locations: list[str] = Field(default_factory=list)
    work_mode: str = "Any"
    sources: list[str] = Field(default_factory=list)
    skills_emphasis: list[str] = Field(default_factory=list)
    natural_summary: str = ""


class JobMentorChatRequest(BaseModel):
    messages: list[MentorMessage] = Field(default_factory=list)
    display_name: str = ""
    current_level: str = ""
    target_role: str = "Senior Full Stack Developer"
    skills: list[str] = Field(default_factory=list)
    years_experience: int = 3
    resume_excerpt: str = ""
    resume_name: str = ""
    min_salary_lpa: float = 15
    max_salary_lpa: float = 30
    preferred_locations: list[str] = Field(default_factory=list)
    work_mode: str = "Any"
    sources: list[str] = Field(default_factory=list)
    limit: int = Field(default=8, ge=1, le=20)


class JobMentorChatResponse(BaseModel):
    reply: str
    search_summary: str
    inferred_intent: InferredSearchIntent
    jobs: list[DiscoveredJob] = Field(default_factory=list)
    total_matches: int = 0
    resume_used: bool = False
    resume_insight: str | None = None
