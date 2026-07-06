from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.resume_repository import ResumeRepository
from app.schemas.resume import (
    ResumeCreate,
    ResumeListResponse,
    ResumeResponse,
    ResumeUpdate,
)

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.get("", response_model=ResumeListResponse)
def list_resumes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    repo = ResumeRepository(db)
    items, total = repo.get_all(skip=skip, limit=limit)
    return ResumeListResponse(
        items=[ResumeResponse.model_validate(i) for i in items],
        total=total,
    )


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    repo = ResumeRepository(db)
    resume = repo.get_by_id(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeResponse.model_validate(resume)


@router.post("", response_model=ResumeResponse, status_code=201)
def create_resume(data: ResumeCreate, db: Session = Depends(get_db)):
    repo = ResumeRepository(db)
    resume = repo.create(data)
    return ResumeResponse.model_validate(resume)


@router.patch("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: int, data: ResumeUpdate, db: Session = Depends(get_db)
):
    repo = ResumeRepository(db)
    resume = repo.update(resume_id, data)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeResponse.model_validate(resume)


@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    repo = ResumeRepository(db)
    if not repo.delete(resume_id):
        raise HTTPException(status_code=404, detail="Resume not found")
