import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TopicStatus(str, enum.Enum):
    PLANNED = "Planned"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


class LearningCategory(str, enum.Enum):
    JAVASCRIPT = "JavaScript"
    TYPESCRIPT = "TypeScript"
    REACT = "React"
    NEXTJS = "Next.js"
    ANGULAR = "Angular"
    NODEJS = "Node.js"
    SQL = "SQL"
    SYSTEM_DESIGN = "System Design"
    DSA = "DSA"
    OTHER = "Other"


class LearningTopic(Base):
    __tablename__ = "learning_topics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[LearningCategory] = mapped_column(
        Enum(LearningCategory), default=LearningCategory.OTHER
    )
    status: Mapped[TopicStatus] = mapped_column(
        Enum(TopicStatus), default=TopicStatus.PLANNED, index=True
    )
    notes: Mapped[str | None] = mapped_column(Text)
    resources: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
