from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.resume import ResumeType


class ResumeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    resume_type: ResumeType = ResumeType.FULLSTACK
    target_role: str | None = None
    skills_highlighted: str | None = None
    notes: str | None = None
    file_path: str | None = None
    last_updated: date | None = None


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    name: str | None = None
    resume_type: ResumeType | None = None
    target_role: str | None = None
    skills_highlighted: str | None = None
    notes: str | None = None
    file_path: str | None = None
    last_updated: date | None = None


class ResumeResponse(ResumeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ResumeListResponse(BaseModel):
    items: list[ResumeResponse]
    total: int
