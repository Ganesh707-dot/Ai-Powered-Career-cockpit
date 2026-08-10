from pydantic import BaseModel, Field


class JobDiscoveryRequest(BaseModel):
    target_role: str = ""
    user_skills: list[str] = Field(default_factory=list)
    years_experience: int = 0
    min_salary_lpa: float = 0
    max_salary_lpa: float = 100
    preferred_locations: list[str] = Field(default_factory=list)
    work_mode: str = "Any"
    sources: list[str] = Field(default_factory=list)
    limit: int = Field(default=20, ge=1, le=50)
    resume_text: str = ""


class DiscoveredJob(BaseModel):
    id: str
    company: str
    role: str
    source: str
    salary_min_lpa: float
    salary_max_lpa: float
    experience_years: str
    location: str
    work_mode: str
    skills: list[str] = Field(default_factory=list)
    description: str
    job_url: str
    posted_days_ago: int
    match_score: float
    match_reasons: list[str] = Field(default_factory=list)


class JobDiscoveryResponse(BaseModel):
    items: list[DiscoveredJob]
    total: int
    filters_applied: dict[str, str | int | float | list[str]]
