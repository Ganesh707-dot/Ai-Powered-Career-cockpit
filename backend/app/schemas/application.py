from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.application import (
    ApplicationStatus,
    JobSource,
    Priority,
    WorkMode,
)


class ApplicationBase(BaseModel):
    company: str = Field(..., min_length=1, max_length=255)
    role: str = Field(..., min_length=1, max_length=255)
    job_url: str | None = None
    source: JobSource = JobSource.OTHER
    salary: str | None = None
    experience: str | None = None
    location: str | None = None
    work_mode: WorkMode = WorkMode.REMOTE
    skills_required: str | None = None
    priority: Priority = Priority.MEDIUM
    status: ApplicationStatus = ApplicationStatus.SAVED
    notes: str | None = None
    tags: str | None = None
    application_date: date | None = None
    follow_up_date: date | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company: str | None = None
    role: str | None = None
    job_url: str | None = None
    source: JobSource | None = None
    salary: str | None = None
    experience: str | None = None
    location: str | None = None
    work_mode: WorkMode | None = None
    skills_required: str | None = None
    priority: Priority | None = None
    status: ApplicationStatus | None = None
    notes: str | None = None
    tags: str | None = None
    application_date: date | None = None
    follow_up_date: date | None = None


class ApplicationResponse(ApplicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ApplicationListResponse(BaseModel):
    items: list[ApplicationResponse]
    total: int
