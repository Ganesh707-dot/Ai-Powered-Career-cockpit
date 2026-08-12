from sqlalchemy.orm import Session

from app.models.resume import Resume, ResumeType
from app.schemas.resume import ResumeCreate, ResumeUpdate


class ResumeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> tuple[list[Resume], int]:
        query = self.db.query(Resume)
        total = query.count()
        items = (
            query.order_by(Resume.updated_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total

    def get_by_id(self, resume_id: int) -> Resume | None:
        return self.db.query(Resume).filter(Resume.id == resume_id).first()

    def _normalize_payload(self, data: dict) -> dict:
        payload = dict(data)
        if "resume_type" in payload:
            payload["resume_type"] = ResumeType.coerce(payload["resume_type"])
        return payload

    def create(self, data: ResumeCreate) -> Resume:
        resume = Resume(**self._normalize_payload(data.model_dump()))
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)
        return resume

    def update(self, resume_id: int, data: ResumeUpdate) -> Resume | None:
        resume = self.get_by_id(resume_id)
        if not resume:
            return None
        update_data = self._normalize_payload(data.model_dump(exclude_unset=True))
        for key, value in update_data.items():
            setattr(resume, key, value)
        self.db.commit()
        self.db.refresh(resume)
        return resume

    def delete(self, resume_id: int) -> bool:
        resume = self.get_by_id(resume_id)
        if not resume:
            return False
        self.db.delete(resume)
        self.db.commit()
        return True
