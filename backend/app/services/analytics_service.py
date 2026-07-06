import re
from collections import Counter
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.application import ApplicationStatus
from app.repositories.application_repository import ApplicationRepository
from app.schemas.analytics import (
    AnalyticsResponse,
    AnalyticsTrend,
    SkillFrequency,
    StatusDistribution,
)


class AnalyticsService:
    def __init__(self, db: Session):
        self.repo = ApplicationRepository(db)

    def get_analytics(self) -> AnalyticsResponse:
        apps = self.repo.get_all_for_analytics()

        # Application trends (last 30 days)
        today = date.today()
        trends: dict[str, int] = {}
        for i in range(30):
            d = today - timedelta(days=i)
            trends[d.isoformat()] = 0

        for app in apps:
            if app.application_date:
                key = app.application_date.isoformat()
                if key in trends:
                    trends[key] += 1

        application_trends = [
            AnalyticsTrend(date=k, count=v)
            for k, v in sorted(trends.items())
        ]

        # Status distribution
        status_counts = Counter(app.status.value for app in apps)
        status_distribution = [
            StatusDistribution(status=s, count=c)
            for s, c in status_counts.items()
        ]

        # Conversion rates
        total = len(apps)
        interviewed = sum(
            1
            for app in apps
            if app.status
            in [
                ApplicationStatus.PHONE_SCREEN,
                ApplicationStatus.TECHNICAL,
                ApplicationStatus.ONSITE,
                ApplicationStatus.OFFER,
                ApplicationStatus.REJECTED,
            ]
        )
        offers = sum(
            1 for app in apps if app.status == ApplicationStatus.OFFER
        )
        interview_conversion = (
            (interviewed / total * 100) if total > 0 else 0.0
        )
        offer_rate = (offers / total * 100) if total > 0 else 0.0

        # Top skills from job descriptions
        skill_counter: Counter = Counter()
        for app in apps:
            if app.skills_required:
                skills = re.split(r"[,;\n|]", app.skills_required)
                for skill in skills:
                    cleaned = skill.strip()
                    if cleaned and len(cleaned) > 1:
                        skill_counter[cleaned] += 1

        top_skills = [
            SkillFrequency(skill=s, count=c)
            for s, c in skill_counter.most_common(15)
        ]

        # Weekly progress (last 8 weeks)
        weekly: dict[str, int] = {}
        for i in range(8):
            week_start = today - timedelta(weeks=i, days=today.weekday())
            weekly[week_start.isoformat()] = 0

        for app in apps:
            if app.application_date:
                week_start = app.application_date - timedelta(
                    days=app.application_date.weekday()
                )
                key = week_start.isoformat()
                if key in weekly:
                    weekly[key] += 1

        weekly_progress = [
            AnalyticsTrend(date=k, count=v)
            for k, v in sorted(weekly.items())
        ]

        companies = list({app.company for app in apps})

        return AnalyticsResponse(
            application_trends=application_trends,
            status_distribution=status_distribution,
            interview_conversion_rate=round(interview_conversion, 1),
            offer_rate=round(offer_rate, 1),
            top_skills=top_skills,
            skill_gaps=[],
            companies_applied=companies,
            weekly_progress=weekly_progress,
        )
