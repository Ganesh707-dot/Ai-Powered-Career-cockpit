from pydantic import BaseModel, Field


class ResumeCoachRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    target_role: str = "Software Engineer"
    job_description: str = ""
    years_experience: int = 3


class ResumeCoachResponse(BaseModel):
    summary: str = ""
    strengths: list[str] = Field(default_factory=list)
    gaps: list[str] = Field(default_factory=list)
    bullet_rewrites: list[str] = Field(default_factory=list)
    keywords_to_add: list[str] = Field(default_factory=list)
    ats_tips: list[str] = Field(default_factory=list)


class CareerInsightsRequest(BaseModel):
    user_skills: list[str] = Field(default_factory=list)
    target_role: str = "Senior Full Stack Developer"
    companies: list[str] = Field(default_factory=list)
    top_skills_from_jobs: list[str] = Field(default_factory=list)
    interview_conversion_rate: float = 0
    offer_rate: float = 0
    total_applications: int = 0


class CareerInsightsResponse(BaseModel):
    headline: str = ""
    insights: list[str] = Field(default_factory=list)
    next_actions: list[str] = Field(default_factory=list)
    skill_gaps: list[str] = Field(default_factory=list)
    learning_plan: list[str] = Field(default_factory=list)
