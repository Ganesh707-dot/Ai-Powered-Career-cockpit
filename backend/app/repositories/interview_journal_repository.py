from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.interview_journal import InterviewJournal
from app.schemas.interview_journal import (
    InterviewJournalCreate,
    InterviewJournalUpdate,
)


class InterviewJournalRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        search: str | None = None,
    ) -> tuple[list[InterviewJournal], int]:
        query = self.db.query(InterviewJournal)

        if search:
            pattern = f"%{search}%"
            query = query.filter(
                or_(
                    InterviewJournal.company.ilike(pattern),
                    InterviewJournal.round.ilike(pattern),
                    InterviewJournal.questions_asked.ilike(pattern),
                    InterviewJournal.lessons_learned.ilike(pattern),
                )
            )

        total = query.count()
        items = (
            query.order_by(InterviewJournal.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total

    def get_by_id(self, entry_id: int) -> InterviewJournal | None:
        return (
            self.db.query(InterviewJournal)
            .filter(InterviewJournal.id == entry_id)
            .first()
        )

    def create(self, data: InterviewJournalCreate) -> InterviewJournal:
        entry = InterviewJournal(**data.model_dump())
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def update(
        self, entry_id: int, data: InterviewJournalUpdate
    ) -> InterviewJournal | None:
        entry = self.get_by_id(entry_id)
        if not entry:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(entry, key, value)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete(self, entry_id: int) -> bool:
        entry = self.get_by_id(entry_id)
        if not entry:
            return False
        self.db.delete(entry)
        self.db.commit()
        return True
