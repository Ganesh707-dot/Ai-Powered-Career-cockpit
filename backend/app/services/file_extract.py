"""Extract plain text from uploaded resume files."""

from __future__ import annotations

import io
from pathlib import Path


class FileExtractError(ValueError):
    pass


ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}


def extract_text(filename: str, content: bytes) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise FileExtractError(
            f"Unsupported file type '{ext}'. Use PDF, TXT, MD, or DOCX."
        )
    if not content:
        raise FileExtractError("Empty file uploaded.")

    if ext in {".txt", ".md"}:
        return content.decode("utf-8", errors="ignore").strip()

    if ext == ".pdf":
        return _extract_pdf(content)

    if ext == ".docx":
        return _extract_docx(content)

    raise FileExtractError("Unsupported file type.")


def _extract_pdf(content: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise FileExtractError("PDF support unavailable (pypdf missing).") from exc

    reader = PdfReader(io.BytesIO(content))
    chunks: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text.strip():
            chunks.append(text.strip())
    joined = "\n\n".join(chunks).strip()
    if not joined:
        raise FileExtractError("Could not extract text from PDF (maybe scanned image).")
    return joined


def _extract_docx(content: bytes) -> str:
    try:
        from docx import Document
    except ImportError as exc:
        raise FileExtractError("DOCX support unavailable (python-docx missing).") from exc

    doc = Document(io.BytesIO(content))
    joined = "\n".join(p.text.strip() for p in doc.paragraphs if p.text.strip())
    if not joined:
        raise FileExtractError("Could not extract text from DOCX.")
    return joined
