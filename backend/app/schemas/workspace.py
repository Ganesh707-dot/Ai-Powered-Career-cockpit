from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class WorkspaceProfilePayload(BaseModel):
    display_name: str = ""
    current_level: str = "Mid-level (2-4 YOE)"
    target_role: str = "Senior Full Stack Developer"
    years_experience: int = 3
    skills: str = ""
    resume_id: int | None = None
    resume_name: str = ""
    resume_excerpt: str = ""
    onboarding_done: bool = False
    min_salary_lpa: float = 15
    max_salary_lpa: float = 30
    preferred_locations: str = "Bangalore, Remote"
    work_mode_pref: str = "Any"
    enabled_portals: list[str] = Field(default_factory=lambda: ["LinkedIn", "Naukri", "Indeed"])
    ai_assist_level: str = "balanced"


class WorkspaceProfileResponse(BaseModel):
    workspace_id: str
    profile: WorkspaceProfilePayload
    updated_at: datetime | None = None


class MentorMessageSchema(BaseModel):
    role: str
    content: str
    at: str | None = None


class JobContextPayload(BaseModel):
    context_key: str
    application_id: int | None = None
    company: str = ""
    role: str = ""
    intent: str = ""
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    skills_focus: list[str] = Field(default_factory=list)
    mentor_thread: list[MentorMessageSchema] = Field(default_factory=list)
    scenarios: list[dict[str, Any]] = Field(default_factory=list)
    live_code: list[dict[str, Any]] = Field(default_factory=list)


class JobContextResponse(JobContextPayload):
    id: int
    updated_at: datetime | None = None


class JobContextListResponse(BaseModel):
    items: list[JobContextResponse]
    total: int
