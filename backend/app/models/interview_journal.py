import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class InterviewOutcome(str, enum.Enum):
    PENDING = "Pending"
    PASSED = "Passed"
    FAILED = "Failed"
    OFFER = "Offer"
    WITHDRAWN = "Withdrawn"


class InterviewJournal(Base):
    __tablename__ = "interview_journals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    company: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    role: Mapped[str | None] = mapped_column(String(255))
    round: Mapped[str] = mapped_column(String(100), nullable=False)
    interviewer: Mapped[str | None] = mapped_column(String(255))
    questions_asked: Mapped[str | None] = mapped_column(Text)
    my_answers: Mapped[str | None] = mapped_column(Text)
    better_answers: Mapped[str | None] = mapped_column(Text)
    feedback: Mapped[str | None] = mapped_column(Text)
    mistakes: Mapped[str | None] = mapped_column(Text)
    lessons_learned: Mapped[str | None] = mapped_column(Text)
    confidence_rating: Mapped[float | None] = mapped_column(Float)
    outcome: Mapped[InterviewOutcome] = mapped_column(
        Enum(InterviewOutcome), default=InterviewOutcome.PENDING
    )
    interview_date: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
