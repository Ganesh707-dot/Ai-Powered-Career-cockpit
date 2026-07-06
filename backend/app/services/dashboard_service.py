from sqlalchemy.orm import Session

from app.models.application import ApplicationStatus
from app.repositories.application_repository import ApplicationRepository
from app.schemas.analytics import (
    DashboardResponse,
    DashboardStats,
    RecentActivity,
    UpcomingInterview,
)


class DashboardService:
    def __init__(self, db: Session):
        self.repo = ApplicationRepository(db)

    def get_dashboard(self) -> DashboardResponse:
        interview_statuses = [
            ApplicationStatus.PHONE_SCREEN,
            ApplicationStatus.TECHNICAL,
            ApplicationStatus.ONSITE,
        ]
        in_progress = sum(
            self.repo.count_by_status(s) for s in interview_statuses
        )

        stats = DashboardStats(
            total_applications=len(self.repo.get_all_for_analytics()),
            today_applications=self.repo.count_today_applications(),
            interviews_scheduled=in_progress,
            offers=self.repo.count_by_status(ApplicationStatus.OFFER),
            rejections=self.repo.count_by_status(ApplicationStatus.REJECTED),
            follow_ups_due=self.repo.count_follow_ups_due(),
            weekly_progress=self.repo.get_weekly_applications(),
            saved=self.repo.count_by_status(ApplicationStatus.SAVED),
            applied=self.repo.count_by_status(ApplicationStatus.APPLIED),
            in_progress=in_progress,
        )

        recent_apps = self.repo.get_recent(limit=8)
        recent_activity = [
            RecentActivity(
                id=app.id,
                type="application",
                title=f"{app.company} — {app.role}",
                description=f"Status: {app.status.value}",
                timestamp=app.updated_at.isoformat(),
            )
            for app in recent_apps
        ]

        upcoming = self.repo.get_upcoming_interviews(limit=5)
        upcoming_interviews = [
            UpcomingInterview(
                id=app.id,
                company=app.company,
                role=app.role,
                status=app.status.value,
                follow_up_date=(
                    app.follow_up_date.isoformat() if app.follow_up_date else None
                ),
            )
            for app in upcoming
        ]

        return DashboardResponse(
            stats=stats,
            recent_activity=recent_activity,
            upcoming_interviews=upcoming_interviews,
        )
