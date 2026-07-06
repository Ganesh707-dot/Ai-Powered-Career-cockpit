import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ResumeType(str, enum.Enum):
    REACT = "React Resume"
    NEXTJS = "Next.js Resume"
    ANGULAR = "Angular Resume"
    FULLSTACK = "Full Stack Resume"
    AI = "AI Resume"
    CUSTOM = "Custom"


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    resume_type: Mapped[ResumeType] = mapped_column(
        Enum(ResumeType), default=ResumeType.FULLSTACK
    )
    target_role: Mapped[str | None] = mapped_column(String(255))
    skills_highlighted: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    file_path: Mapped[str | None] = mapped_column(String(512))
    last_updated: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
