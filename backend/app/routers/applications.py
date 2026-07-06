from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.application import ApplicationStatus, Priority
from app.repositories.application_repository import ApplicationRepository
from app.schemas.application import (
    ApplicationCreate,
    ApplicationListResponse,
    ApplicationResponse,
    ApplicationUpdate,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=ApplicationListResponse)
def list_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: str | None = None,
    status: ApplicationStatus | None = None,
    priority: Priority | None = None,
    sort_by: str = "updated_at",
    sort_order: str = "desc",
    db: Session = Depends(get_db),
):
    repo = ApplicationRepository(db)
    items, total = repo.get_all(
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        priority=priority.value if priority else None,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return ApplicationListResponse(
        items=[ApplicationResponse.model_validate(i) for i in items],
        total=total,
    )


@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(app_id: int, db: Session = Depends(get_db)):
    repo = ApplicationRepository(db)
    app = repo.get_by_id(app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationResponse.model_validate(app)


@router.post("", response_model=ApplicationResponse, status_code=201)
def create_application(data: ApplicationCreate, db: Session = Depends(get_db)):
    repo = ApplicationRepository(db)
    app = repo.create(data)
    return ApplicationResponse.model_validate(app)


@router.patch("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: int, data: ApplicationUpdate, db: Session = Depends(get_db)
):
    repo = ApplicationRepository(db)
    app = repo.update(app_id, data)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationResponse.model_validate(app)


@router.delete("/{app_id}", status_code=204)
def delete_application(app_id: int, db: Session = Depends(get_db)):
    repo = ApplicationRepository(db)
    if not repo.delete(app_id):
        raise HTTPException(status_code=404, detail="Application not found")


@router.patch("/{app_id}/status", response_model=ApplicationResponse)
def update_status(
    app_id: int, status: ApplicationStatus, db: Session = Depends(get_db)
):
    repo = ApplicationRepository(db)
    app = repo.update(app_id, ApplicationUpdate(status=status))
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationResponse.model_validate(app)
