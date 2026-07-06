from sqlalchemy.orm import Session

from app.models.learning_topic import LearningTopic, TopicStatus
from app.schemas.learning_topic import LearningTopicCreate, LearningTopicUpdate


class LearningTopicRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        status: TopicStatus | None = None,
    ) -> tuple[list[LearningTopic], int]:
        query = self.db.query(LearningTopic)
        if status:
            query = query.filter(LearningTopic.status == status)
        total = query.count()
        items = (
            query.order_by(LearningTopic.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total

    def get_by_id(self, topic_id: int) -> LearningTopic | None:
        return (
            self.db.query(LearningTopic)
            .filter(LearningTopic.id == topic_id)
            .first()
        )

    def create(self, data: LearningTopicCreate) -> LearningTopic:
        topic = LearningTopic(**data.model_dump())
        self.db.add(topic)
        self.db.commit()
        self.db.refresh(topic)
        return topic

    def update(
        self, topic_id: int, data: LearningTopicUpdate
    ) -> LearningTopic | None:
        topic = self.get_by_id(topic_id)
        if not topic:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(topic, key, value)
        self.db.commit()
        self.db.refresh(topic)
        return topic

    def delete(self, topic_id: int) -> bool:
        topic = self.get_by_id(topic_id)
        if not topic:
            return False
        self.db.delete(topic)
        self.db.commit()
        return True

    def count_by_status(self, status: TopicStatus) -> int:
        return (
            self.db.query(LearningTopic)
            .filter(LearningTopic.status == status)
            .count()
        )
