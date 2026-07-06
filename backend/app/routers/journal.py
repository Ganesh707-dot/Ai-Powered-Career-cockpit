from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.interview_journal_repository import InterviewJournalRepository
from app.schemas.interview_journal import (
    InterviewJournalCreate,
    InterviewJournalListResponse,
    InterviewJournalResponse,
    InterviewJournalUpdate,
)

router = APIRouter(prefix="/journal", tags=["Interview Journal"])


@router.get("", response_model=InterviewJournalListResponse)
def list_entries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: str | None = None,
    db: Session = Depends(get_db),
):
    repo = InterviewJournalRepository(db)
    items, total = repo.get_all(skip=skip, limit=limit, search=search)
    return InterviewJournalListResponse(
        items=[InterviewJournalResponse.model_validate(i) for i in items],
        total=total,
    )


@router.get("/{entry_id}", response_model=InterviewJournalResponse)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    repo = InterviewJournalRepository(db)
    entry = repo.get_by_id(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return InterviewJournalResponse.model_validate(entry)


@router.post("", response_model=InterviewJournalResponse, status_code=201)
def create_entry(data: InterviewJournalCreate, db: Session = Depends(get_db)):
    repo = InterviewJournalRepository(db)
    entry = repo.create(data)
    return InterviewJournalResponse.model_validate(entry)


@router.patch("/{entry_id}", response_model=InterviewJournalResponse)
def update_entry(
    entry_id: int, data: InterviewJournalUpdate, db: Session = Depends(get_db)
):
    repo = InterviewJournalRepository(db)
    entry = repo.update(entry_id, data)
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return InterviewJournalResponse.model_validate(entry)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    repo = InterviewJournalRepository(db)
    if not repo.delete(entry_id):
        raise HTTPException(status_code=404, detail="Journal entry not found")
