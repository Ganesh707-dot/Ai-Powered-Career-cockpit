from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_applications: int = 0
    today_applications: int = 0
    interviews_scheduled: int = 0
    offers: int = 0
    rejections: int = 0
    follow_ups_due: int = 0
    weekly_goal: int = 10
    weekly_progress: int = 0
    saved: int = 0
    applied: int = 0
    in_progress: int = 0


class RecentActivity(BaseModel):
    id: int
    type: str
    title: str
    description: str
    timestamp: str


class UpcomingInterview(BaseModel):
    id: int
    company: str
    role: str
    status: str
    follow_up_date: str | None = None


class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_activity: list[RecentActivity]
    upcoming_interviews: list[UpcomingInterview]


class AnalyticsTrend(BaseModel):
    date: str
    count: int


class SkillFrequency(BaseModel):
    skill: str
    count: int


class StatusDistribution(BaseModel):
    status: str
    count: int


class AnalyticsResponse(BaseModel):
    application_trends: list[AnalyticsTrend]
    status_distribution: list[StatusDistribution]
    interview_conversion_rate: float
    offer_rate: float
    top_skills: list[SkillFrequency]
    skill_gaps: list[SkillFrequency]
    companies_applied: list[str]
    weekly_progress: list[AnalyticsTrend]
