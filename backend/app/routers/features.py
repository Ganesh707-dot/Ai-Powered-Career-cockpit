from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.analytics import AnalyticsResponse, DashboardResponse
from app.schemas.career_coach import (
    CareerInsightsRequest,
    CareerInsightsResponse,
    ResumeCoachRequest,
    ResumeCoachResponse,
)
from app.schemas.jd_analysis import JDAnalysisRequest, JDAnalysisResponse
from app.schemas.interview_prep import (
    HRAnswerRequest,
    HRAnswerResponse,
    InterviewPrepRequest,
    InterviewPrepResponse,
    MockInterviewRequest,
    MockInterviewResponse,
)
from app.schemas.mentor import (
    LearningPathRequest,
    LearningPathResponse,
    MentorChatRequest,
    MentorChatResponse,
)
from app.services.analytics_service import AnalyticsService
from app.services.career_coach_service import CareerCoachService
from app.services.dashboard_service import DashboardService
from app.services.interview_prep_service import InterviewPrepService
from app.services.jd_analysis_service import JDAnalysisService
from app.services.learning_path_service import LearningPathService
from app.services.mentor_service import MentorService

router = APIRouter(tags=["Features"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    return DashboardService(db).get_dashboard()


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_analytics()


@router.post("/jd-analysis", response_model=JDAnalysisResponse)
def analyze_jd(request: JDAnalysisRequest):
    return JDAnalysisService().analyze(request)


@router.post("/interview-prep", response_model=InterviewPrepResponse)
def generate_interview_prep(request: InterviewPrepRequest):
    return InterviewPrepService().generate(request)


@router.post("/hr-answers", response_model=HRAnswerResponse)
def generate_hr_answers(request: HRAnswerRequest):
    return InterviewPrepService().generate_hr_answers(request)


@router.post("/mock-interview", response_model=MockInterviewResponse)
def mock_interview(request: MockInterviewRequest):
    return InterviewPrepService().evaluate_mock(request)


@router.get("/hr-questions")
def list_hr_questions():
    return InterviewPrepService().get_hr_question_keys()


@router.get("/interview-categories")
def list_interview_categories():
    return InterviewPrepService().get_categories()


@router.post("/resume-coach", response_model=ResumeCoachResponse)
def resume_coach(request: ResumeCoachRequest):
    return CareerCoachService().coach_resume(request)


@router.post("/career-insights", response_model=CareerInsightsResponse)
def career_insights(request: CareerInsightsRequest, db: Session = Depends(get_db)):
    analytics = AnalyticsService(db).get_analytics()
    payload = CareerInsightsRequest(
        user_skills=request.user_skills,
        target_role=request.target_role,
        companies=request.companies or analytics.companies_applied,
        top_skills_from_jobs=request.top_skills_from_jobs
        or [s.skill for s in analytics.top_skills],
        interview_conversion_rate=request.interview_conversion_rate
        or analytics.interview_conversion_rate,
        offer_rate=request.offer_rate or analytics.offer_rate,
        total_applications=request.total_applications
        or sum(s.count for s in analytics.status_distribution),
    )
    return CareerCoachService().career_insights(payload)


@router.post("/mentor/chat", response_model=MentorChatResponse)
def mentor_chat(request: MentorChatRequest):
    return MentorService().chat(request)


@router.post("/mentor/stream")
def mentor_stream(request: MentorChatRequest):
    import json

    service = MentorService()

    def event_generator():
        try:
            for chunk in service.stream_reply(request):
                yield f"data: {json.dumps({'text': chunk})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/learning/generate-path", response_model=LearningPathResponse)
def generate_learning_path(
    request: LearningPathRequest, db: Session = Depends(get_db)
):
    return LearningPathService(db).generate(request)


@router.get("/ai-status")
def ai_status():
    from app.config import settings
    from app.services.ai_client import gemini_client

    return {
        "provider": getattr(gemini_client, "provider_name", settings.ai_provider),
        "model": getattr(gemini_client, "model_name", settings.gemini_model),
        "configured": settings.ai_enabled,
        "swap_hint": "Set AI_PROVIDER=openai + OPENAI_API_KEY to use GPT later",
        "features": [
            "jd-analysis",
            "interview-prep",
            "hr-answers",
            "resume-upload",
            "resume-coach",
            "career-insights",
            "mentor-chat",
            "mentor-stream",
            "learning-path",
            "mock-interview",
        ],
    }
