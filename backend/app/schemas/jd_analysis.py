from pydantic import BaseModel, Field


class JDAnalysisRequest(BaseModel):
    job_description: str = Field(..., min_length=10)
    user_skills: list[str] = Field(default_factory=list)


class JDAnalysisResponse(BaseModel):
    company: str | None = None
    role: str | None = None
    experience: str | None = None
    technical_skills: list[str] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)
    databases: list[str] = Field(default_factory=list)
    cloud: list[str] = Field(default_factory=list)
    devops: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)
    match_score: float = 0.0
    strength_areas: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    resume_suggestions: list[str] = Field(default_factory=list)
    interview_focus_topics: list[str] = Field(default_factory=list)
    learning_recommendations: list[str] = Field(default_factory=list)
