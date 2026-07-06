from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.learning_topic import LearningCategory, TopicStatus


class LearningTopicBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    category: LearningCategory = LearningCategory.OTHER
    status: TopicStatus = TopicStatus.PLANNED
    notes: str | None = None
    resources: str | None = None


class LearningTopicCreate(LearningTopicBase):
    pass


class LearningTopicUpdate(BaseModel):
    title: str | None = None
    category: LearningCategory | None = None
    status: TopicStatus | None = None
    notes: str | None = None
    resources: str | None = None


class LearningTopicResponse(LearningTopicBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class LearningTopicListResponse(BaseModel):
    items: list[LearningTopicResponse]
    total: int
