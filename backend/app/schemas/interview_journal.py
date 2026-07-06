from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.interview_journal import InterviewOutcome


class InterviewJournalBase(BaseModel):
    company: str = Field(..., min_length=1, max_length=255)
    role: str | None = None
    round: str = Field(..., min_length=1, max_length=100)
    interviewer: str | None = None
    questions_asked: str | None = None
    my_answers: str | None = None
    better_answers: str | None = None
    feedback: str | None = None
    mistakes: str | None = None
    lessons_learned: str | None = None
    confidence_rating: float | None = Field(None, ge=0, le=10)
    outcome: InterviewOutcome = InterviewOutcome.PENDING
    interview_date: datetime | None = None


class InterviewJournalCreate(InterviewJournalBase):
    pass


class InterviewJournalUpdate(BaseModel):
    company: str | None = None
    role: str | None = None
    round: str | None = None
    interviewer: str | None = None
    questions_asked: str | None = None
    my_answers: str | None = None
    better_answers: str | None = None
    feedback: str | None = None
    mistakes: str | None = None
    lessons_learned: str | None = None
    confidence_rating: float | None = Field(None, ge=0, le=10)
    outcome: InterviewOutcome | None = None
    interview_date: datetime | None = None


class InterviewJournalResponse(InterviewJournalBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class InterviewJournalListResponse(BaseModel):
    items: list[InterviewJournalResponse]
    total: int
