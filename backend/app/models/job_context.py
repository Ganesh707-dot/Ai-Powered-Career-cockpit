from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class JobContext(Base):
    """Per-job execution context — separate memory for each application."""

    __tablename__ = "job_contexts"
    __table_args__ = (
        UniqueConstraint("workspace_id", "context_key", name="uq_job_context_workspace_key"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    workspace_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    context_key: Mapped[str] = mapped_column(String(255), nullable=False)
    application_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    company: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    role: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    intent: Mapped[str] = mapped_column(Text, nullable=False, default="")
    strengths_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    weaknesses_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    skills_focus_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    mentor_thread_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    scenarios_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    live_code_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
