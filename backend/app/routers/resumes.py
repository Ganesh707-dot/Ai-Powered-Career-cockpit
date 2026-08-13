import base64
import logging
import tempfile
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.database import ensure_resume_schema, get_db
from app.models.resume import ResumeType
from app.repositories.resume_repository import ResumeRepository
from app.schemas.resume import (
    ResumeCreate,
    ResumeListResponse,
    ResumeResponse,
    ResumeTextResponse,
    ResumeUpdate,
    ResumeUploadJson,
)
from app.services.file_extract import FileExtractError, extract_text

router = APIRouter(prefix="/resumes", tags=["Resumes"])
logger = logging.getLogger("careerpilot.resumes")

MAX_BYTES = 4 * 1024 * 1024


def _to_response(resume) -> ResumeResponse:
    text = resume.extracted_text or ""
    try:
        return ResumeResponse(
            id=resume.id,
            name=resume.name,
            resume_type=ResumeType(ResumeType.coerce(resume.resume_type)),
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
    except Exception as exc:
        logger.exception("Resume response serialization failed for id=%s", resume.id)
        raise HTTPException(status_code=500, detail="Resume saved but response failed.") from exc


def _save_resume_from_bytes(
    db: Session,
    *,
    raw: bytes,
    filename: str,
    name: str | None,
    resume_type: str,
    target_role: str | None,
) -> ResumeResponse:
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 4MB)")

    safe_name = Path(filename).name[:255] or "resume.txt"
    try:
        text = extract_text(safe_name, raw)
    except FileExtractError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Text extraction failed for %s", safe_name)
        raise HTTPException(
            status_code=400,
            detail="Could not read this file. Try Paste text or a text-based PDF/DOCX.",
        ) from exc

    rtype = ResumeType.coerce(resume_type)
    ensure_resume_schema()
    repo = ResumeRepository(db)
    try:
        resume = repo.create(
            ResumeCreate(
                name=(name or Path(safe_name).stem)[:255],
                resume_type=ResumeType(rtype),
                target_role=target_role,
                original_filename=safe_name,
                extracted_text=text[:50000],
                last_updated=date.today(),
                notes=f"Uploaded file: {safe_name}",
            )
        )
    except Exception as exc:
        logger.exception("Resume upload DB error")
        raise HTTPException(
            status_code=500,
            detail="Could not save resume to database. Try Paste text or Add manually.",
        ) from exc

    try:
        upload_dir = Path(tempfile.gettempdir()) / "careerpilot_uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        dest = upload_dir / f"{date.today().isoformat()}_{safe_name}"
        dest.write_bytes(raw)
        repo.update(resume.id, ResumeUpdate(file_path=str(dest)))
        resume = repo.get_by_id(resume.id) or resume
    except Exception:
        logger.warning("Temp file save skipped for resume %s", resume.id)

    return _to_response(resume)


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
    ensure_resume_schema()
    repo = ResumeRepository(db)
    try:
        resume = repo.create(data)
    except Exception as exc:
        logger.exception("Resume create DB error")
        raise HTTPException(
            status_code=500,
            detail="Could not save resume to database. Try again or paste text instead.",
        ) from exc
    return _to_response(resume)


@router.post("/paste", response_model=ResumeResponse, status_code=201)
def paste_resume(
    name: str = Form(...),
    text: str = Form(...),
    resume_type: str = Form("Full Stack Resume"),
    target_role: str | None = Form(None),
    db: Session = Depends(get_db),
):
    """Save pasted resume or personal statement text (no file required)."""
    body = text.strip()
    if len(body) < 20:
        raise HTTPException(
            status_code=400,
            detail="Paste at least 20 characters of resume or statement text.",
        )
    ensure_resume_schema()
    rtype = ResumeType.coerce(resume_type)
    repo = ResumeRepository(db)
    try:
        resume = repo.create(
            ResumeCreate(
                name=name.strip() or "Pasted resume",
                resume_type=ResumeType(rtype),
                target_role=target_role,
                extracted_text=body[:50000],
                original_filename="pasted.txt",
                last_updated=date.today(),
                notes="Pasted resume / statement text",
            )
        )
    except Exception as exc:
        logger.exception("Resume paste DB error")
        raise HTTPException(
            status_code=500,
            detail="Could not save resume to database. Try again in a few seconds.",
        ) from exc
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
    filename = file.filename or "resume.txt"
    return _save_resume_from_bytes(
        db,
        raw=raw,
        filename=filename,
        name=name,
        resume_type=resume_type,
        target_role=target_role,
    )


@router.post("/upload-json", response_model=ResumeResponse, status_code=201)
def upload_resume_json(body: ResumeUploadJson, db: Session = Depends(get_db)):
    """Reliable JSON/base64 upload — fallback when multipart fails on mobile or CDN."""
    try:
        raw = base64.b64decode(body.content_base64, validate=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid file encoding.") from exc
    return _save_resume_from_bytes(
        db,
        raw=raw,
        filename=body.filename,
        name=body.name,
        resume_type=body.resume_type,
        target_role=body.target_role,
    )


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
