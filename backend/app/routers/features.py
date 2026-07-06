from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.analytics import AnalyticsResponse, DashboardResponse
from app.schemas.jd_analysis import JDAnalysisRequest, JDAnalysisResponse
from app.schemas.interview_prep import (
    HRAnswerRequest,
    HRAnswerResponse,
    InterviewPrepRequest,
    InterviewPrepResponse,
)
from app.services.analytics_service import AnalyticsService
from app.services.dashboard_service import DashboardService
from app.services.interview_prep_service import InterviewPrepService
from app.services.jd_analysis_service import JDAnalysisService

router = APIRouter(tags=["Features"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    service = DashboardService(db)
    return service.get_dashboard()


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return service.get_analytics()


@router.post("/jd-analysis", response_model=JDAnalysisResponse)
def analyze_jd(request: JDAnalysisRequest):
    service = JDAnalysisService()
    return service.analyze(request)


@router.post("/interview-prep", response_model=InterviewPrepResponse)
def generate_interview_prep(request: InterviewPrepRequest):
    service = InterviewPrepService()
    return service.generate(request)


@router.post("/hr-answers", response_model=HRAnswerResponse)
def generate_hr_answers(request: HRAnswerRequest):
    service = InterviewPrepService()
    return service.generate_hr_answers(request)


@router.get("/hr-questions")
def list_hr_questions():
    service = InterviewPrepService()
    return service.get_hr_question_keys()


@router.get("/interview-categories")
def list_interview_categories():
    service = InterviewPrepService()
    return service.get_categories()
