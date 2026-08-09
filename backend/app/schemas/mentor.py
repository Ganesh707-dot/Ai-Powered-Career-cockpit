from pydantic import BaseModel, Field


class MentorMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|model)$")
    content: str = Field(..., min_length=1)


class MentorChatRequest(BaseModel):
    messages: list[MentorMessage] = Field(default_factory=list)
    current_level: str = "junior / mid"
    target_role: str = "Senior Full Stack Developer"
    skills: list[str] = Field(default_factory=list)
    years_experience: int = 3
    resume_excerpt: str = ""


class MentorChatResponse(BaseModel):
    reply: str
    level_assessment: str | None = None
    next_actions: list[str] = Field(default_factory=list)
    suggested_topics: list[str] = Field(default_factory=list)


class LearningPathRequest(BaseModel):
    current_level: str = "junior / mid"
    target_role: str = "Senior Full Stack Developer"
    skills: list[str] = Field(default_factory=list)
    years_experience: int = 3
    weeks: int = Field(default=6, ge=2, le=16)
    focus_areas: list[str] = Field(default_factory=list)
    persist: bool = True


class LearningPathItem(BaseModel):
    title: str
    category: str
    week: int
    why: str
    resources: str = ""
    status: str = "Planned"


class LearningPathResponse(BaseModel):
    headline: str
    roadmap_summary: str
    items: list[LearningPathItem]
    created_topic_ids: list[int] = Field(default_factory=list)
