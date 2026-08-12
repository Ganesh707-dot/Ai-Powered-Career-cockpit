import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ResumeType(str, enum.Enum):
    REACT = "React Resume"
    NEXTJS = "Next.js Resume"
    ANGULAR = "Angular Resume"
    FULLSTACK = "Full Stack Resume"
    AI = "AI Resume"
    CUSTOM = "Custom"

    @classmethod
    def coerce(cls, value: "ResumeType | str | None") -> str:
        if value is None:
            return cls.FULLSTACK.value
        if isinstance(value, cls):
            return value.value
        text = str(value).strip()
        try:
            return cls(text).value
        except ValueError:
            for member in cls:
                if member.name == text.upper().replace(" ", "_").replace(".", ""):
                    return member.value
            return cls.FULLSTACK.value


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # VARCHAR — avoids PostgreSQL native ENUM mismatches on Neon/serverless
    resume_type: Mapped[str] = mapped_column(
        String(64), default=ResumeType.FULLSTACK.value, nullable=False
    )
    target_role: Mapped[str | None] = mapped_column(String(255))
    skills_highlighted: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    file_path: Mapped[str | None] = mapped_column(String(512))
    original_filename: Mapped[str | None] = mapped_column(String(255))
    extracted_text: Mapped[str | None] = mapped_column(Text)
    last_updated: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
