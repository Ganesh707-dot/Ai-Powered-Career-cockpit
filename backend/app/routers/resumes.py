import tempfile
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.resume import ResumeType
from app.repositories.resume_repository import ResumeRepository
from app.schemas.resume import (
    ResumeCreate,
    ResumeListResponse,
    ResumeResponse,
    ResumeTextResponse,
    ResumeUpdate,
)
from app.services.file_extract import FileExtractError, extract_text

router = APIRouter(prefix="/resumes", tags=["Resumes"])


def _to_response(resume) -> ResumeResponse:
    text = resume.extracted_text or ""
    return ResumeResponse(
        id=resume.id,
        name=resume.name,
        resume_type=resume.resume_type,
        target_role=resume.target_role,
        skills_highlighted=resume.skills_highlighted,
        notes=resume.notes,
        file_path=resume.file_path,
        original_filename=resume.original_filename,
        last_updated=resume.last_updated,
        has_file=bool(resume.original_filename or resume.file_path),
        has_extracted_text=bool(text.strip()),
        extracted_text_preview=(text[:280] + "…") if len(text) > 280 else (text or None),
        created_at=resume.created_at,
        updated_at=resume.updated_at,
    )


@router.get("", response_model=ResumeListResponse)
def list_resumes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    repo = ResumeRepository(db)
    items, total = repo.get_all(skip=skip, limit=limit)
    return ResumeListResponse(items=[_to_response(i) for i in items], total=total)


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    repo = ResumeRepository(db)
    resume = repo.get_by_id(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return _to_response(resume)


@router.get("/{resume_id}/text", response_model=ResumeTextResponse)
def get_resume_text(resume_id: int, db: Session = Depends(get_db)):
    repo = ResumeRepository(db)
    resume = repo.get_by_id(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not resume.extracted_text:
        raise HTTPException(status_code=404, detail="No extracted text for this resume")
    return ResumeTextResponse(id=resume.id, extracted_text=resume.extracted_text)


@router.post("", response_model=ResumeResponse, status_code=201)
def create_resume(data: ResumeCreate, db: Session = Depends(get_db)):
    repo = ResumeRepository(db)
    resume = repo.create(data)
    return _to_response(resume)


@router.post("/upload", response_model=ResumeResponse, status_code=201)
async def upload_resume(
    file: UploadFile = File(...),
    name: str | None = Form(None),
    target_role: str | None = Form(None),
    resume_type: str = Form("Full Stack Resume"),
    db: Session = Depends(get_db),
):
    raw = await file.read()
    if len(raw) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 8MB)")

    filename = file.filename or "resume.txt"
    try:
        text = extract_text(filename, raw)
    except FileExtractError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        rtype = ResumeType(resume_type)
    except ValueError:
        rtype = ResumeType.FULLSTACK

    # Persist file to writable tmp (ephemeral on serverless; text lives in DB)
    upload_dir = Path(tempfile.gettempdir()) / "careerpilot_uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(filename).name
    dest = upload_dir / f"{date.today().isoformat()}_{safe_name}"
    dest.write_bytes(raw)

    repo = ResumeRepository(db)
    resume = repo.create(
        ResumeCreate(
            name=name or Path(filename).stem,
            resume_type=rtype,
            target_role=target_role,
            original_filename=safe_name,
            file_path=str(dest),
            extracted_text=text[:50000],
            last_updated=date.today(),
            notes=f"Uploaded file: {safe_name}",
        )
    )
    return _to_response(resume)


@router.patch("/{resume_id}", response_model=ResumeResponse)
def update_resume(
    resume_id: int, data: ResumeUpdate, db: Session = Depends(get_db)
):
    repo = ResumeRepository(db)
    resume = repo.update(resume_id, data)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return _to_response(resume)


@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    repo = ResumeRepository(db)
    if not repo.delete(resume_id):
        raise HTTPException(status_code=404, detail="Resume not found")
