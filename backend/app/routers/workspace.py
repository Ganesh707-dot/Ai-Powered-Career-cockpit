from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.workspace import get_workspace_id
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.workspace import (
    JobContextListResponse,
    JobContextPayload,
    JobContextResponse,
    MentorMessageSchema,
    WorkspaceProfilePayload,
    WorkspaceProfileResponse,
)

router = APIRouter(prefix="/workspace", tags=["Workspace"])


@router.get("/profile", response_model=WorkspaceProfileResponse)
def get_workspace_profile(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    repo = WorkspaceRepository(db)
    row = repo.get_profile(workspace_id)
    profile_data = repo.profile_as_dict(workspace_id)
    return WorkspaceProfileResponse(
        workspace_id=workspace_id,
        profile=WorkspaceProfilePayload.model_validate(profile_data),
        updated_at=row.updated_at if row else None,
    )


@router.put("/profile", response_model=WorkspaceProfileResponse)
def put_workspace_profile(
    body: WorkspaceProfilePayload,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    repo = WorkspaceRepository(db)
    row = repo.upsert_profile(workspace_id, body)
    return WorkspaceProfileResponse(
        workspace_id=workspace_id,
        profile=body,
        updated_at=row.updated_at,
    )


@router.get("/job-contexts", response_model=JobContextListResponse)
def list_job_contexts(
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    repo = WorkspaceRepository(db)
    rows = repo.list_contexts(workspace_id)
    items = [
        JobContextResponse(
            id=r.id,
            updated_at=r.updated_at,
            **repo.context_to_payload(r).model_dump(),
        )
        for r in rows
    ]
    return JobContextListResponse(items=items, total=len(items))


@router.get("/job-contexts/{context_key}", response_model=JobContextResponse)
def get_job_context(
    context_key: str,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    repo = WorkspaceRepository(db)
    row = repo.get_context(workspace_id, context_key)
    if not row:
        return JobContextResponse(
            id=0,
            context_key=context_key,
            company="",
            role="",
        )
    return JobContextResponse(
        id=row.id,
        updated_at=row.updated_at,
        **repo.context_to_payload(row).model_dump(),
    )


@router.put("/job-contexts/{context_key}", response_model=JobContextResponse)
def put_job_context(
    context_key: str,
    body: JobContextPayload,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    repo = WorkspaceRepository(db)
    payload = body.model_copy(update={"context_key": context_key})
    row = repo.upsert_context(workspace_id, payload)
    return JobContextResponse(
        id=row.id,
        updated_at=row.updated_at,
        **repo.context_to_payload(row).model_dump(),
    )


@router.post("/job-contexts/{context_key}/messages", response_model=JobContextResponse)
def append_context_message(
    context_key: str,
    body: MentorMessageSchema,
    workspace_id: str = Depends(get_workspace_id),
    db: Session = Depends(get_db),
):
    repo = WorkspaceRepository(db)
    row = repo.append_mentor_message(
        workspace_id, context_key, body.role, body.content
    )
    return JobContextResponse(
        id=row.id,
        updated_at=row.updated_at,
        **repo.context_to_payload(row).model_dump(),
    )
