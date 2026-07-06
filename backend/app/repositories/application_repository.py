from datetime import date

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.application import Application, ApplicationStatus
from app.schemas.application import ApplicationCreate, ApplicationUpdate


class ApplicationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        search: str | None = None,
        status: ApplicationStatus | None = None,
        priority: str | None = None,
        sort_by: str = "updated_at",
        sort_order: str = "desc",
    ) -> tuple[list[Application], int]:
        query = self.db.query(Application)

        if search:
            pattern = f"%{search}%"
            query = query.filter(
                or_(
                    Application.company.ilike(pattern),
                    Application.role.ilike(pattern),
                    Application.location.ilike(pattern),
                    Application.tags.ilike(pattern),
                )
            )

        if status:
            query = query.filter(Application.status == status)

        if priority:
            query = query.filter(Application.priority == priority)

        total = query.count()

        sort_column = getattr(Application, sort_by, Application.updated_at)
        if sort_order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        items = query.offset(skip).limit(limit).all()
        return items, total

    def get_by_id(self, app_id: int) -> Application | None:
        return self.db.query(Application).filter(Application.id == app_id).first()

    def create(self, data: ApplicationCreate) -> Application:
        app = Application(**data.model_dump())
        self.db.add(app)
        self.db.commit()
        self.db.refresh(app)
        return app

    def update(self, app_id: int, data: ApplicationUpdate) -> Application | None:
        app = self.get_by_id(app_id)
        if not app:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(app, key, value)
        self.db.commit()
        self.db.refresh(app)
        return app

    def delete(self, app_id: int) -> bool:
        app = self.get_by_id(app_id)
        if not app:
            return False
        self.db.delete(app)
        self.db.commit()
        return True

    def count_by_status(self, status: ApplicationStatus) -> int:
        return (
            self.db.query(Application)
            .filter(Application.status == status)
            .count()
        )

    def count_today_applications(self) -> int:
        today = date.today()
        return (
            self.db.query(Application)
            .filter(Application.application_date == today)
            .count()
        )

    def count_follow_ups_due(self) -> int:
        today = date.today()
        return (
            self.db.query(Application)
            .filter(
                Application.follow_up_date <= today,
                Application.status.notin_([
                    ApplicationStatus.REJECTED,
                    ApplicationStatus.OFFER,
                    ApplicationStatus.WITHDRAWN,
                ]),
            )
            .count()
        )

    def get_upcoming_interviews(self, limit: int = 5) -> list[Application]:
        interview_statuses = [
            ApplicationStatus.PHONE_SCREEN,
            ApplicationStatus.TECHNICAL,
            ApplicationStatus.ONSITE,
        ]
        return (
            self.db.query(Application)
            .filter(Application.status.in_(interview_statuses))
            .order_by(Application.follow_up_date.asc())
            .limit(limit)
            .all()
        )

    def get_recent(self, limit: int = 10) -> list[Application]:
        return (
            self.db.query(Application)
            .order_by(Application.updated_at.desc())
            .limit(limit)
            .all()
        )

    def get_weekly_applications(self) -> int:
        from datetime import timedelta

        week_start = date.today() - timedelta(days=date.today().weekday())
        return (
            self.db.query(Application)
            .filter(Application.application_date >= week_start)
            .count()
        )

    def get_all_for_analytics(self) -> list[Application]:
        return self.db.query(Application).all()
