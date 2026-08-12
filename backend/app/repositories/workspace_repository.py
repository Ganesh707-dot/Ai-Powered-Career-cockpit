import json
from typing import Any

from sqlalchemy.orm import Session

from app.models.job_context import JobContext
from app.models.workspace_profile import WorkspaceProfile
from app.schemas.workspace import JobContextPayload, WorkspaceProfilePayload


DEFAULT_PROFILE = WorkspaceProfilePayload()


class WorkspaceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_profile(self, workspace_id: str) -> WorkspaceProfile | None:
        return (
            self.db.query(WorkspaceProfile)
            .filter(WorkspaceProfile.workspace_id == workspace_id)
            .first()
        )

    def upsert_profile(
        self, workspace_id: str, profile: WorkspaceProfilePayload
    ) -> WorkspaceProfile:
        row = self.get_profile(workspace_id)
        payload = profile.model_dump()
        if row:
            row.profile_json = json.dumps(payload)
        else:
            row = WorkspaceProfile(
                workspace_id=workspace_id,
                profile_json=json.dumps(payload),
            )
            self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def profile_as_dict(self, workspace_id: str) -> dict[str, Any]:
        row = self.get_profile(workspace_id)
        if not row:
            return DEFAULT_PROFILE.model_dump()
        try:
            return json.loads(row.profile_json)
        except json.JSONDecodeError:
            return DEFAULT_PROFILE.model_dump()

    def list_contexts(self, workspace_id: str) -> list[JobContext]:
        return (
            self.db.query(JobContext)
            .filter(JobContext.workspace_id == workspace_id)
            .order_by(JobContext.updated_at.desc())
            .all()
        )

    def get_context(self, workspace_id: str, context_key: str) -> JobContext | None:
        return (
            self.db.query(JobContext)
            .filter(
                JobContext.workspace_id == workspace_id,
                JobContext.context_key == context_key,
            )
            .first()
        )

    def upsert_context(
        self, workspace_id: str, data: JobContextPayload
    ) -> JobContext:
        row = self.get_context(workspace_id, data.context_key)
        if row:
            self._apply_context(row, data)
        else:
            row = JobContext(workspace_id=workspace_id, context_key=data.context_key)
            self._apply_context(row, data)
            self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def append_mentor_message(
        self,
        workspace_id: str,
        context_key: str,
        role: str,
        content: str,
        company: str = "Career Map",
        role_title: str = "General",
    ) -> JobContext:
        from datetime import datetime, timezone

        row = self.get_context(workspace_id, context_key)
        if not row:
            row = JobContext(
                workspace_id=workspace_id,
                context_key=context_key,
                company=company,
                role=role_title,
            )
            self.db.add(row)
        try:
            thread = json.loads(row.mentor_thread_json or "[]")
        except json.JSONDecodeError:
            thread = []
        thread.append(
            {
                "role": role,
                "content": content,
                "at": datetime.now(timezone.utc).isoformat(),
            }
        )
        row.mentor_thread_json = json.dumps(thread[-40:])
        self.db.commit()
        self.db.refresh(row)
        return row

    @staticmethod
    def _apply_context(row: JobContext, data: JobContextPayload) -> None:
        row.application_id = data.application_id
        row.company = data.company
        row.role = data.role
        row.intent = data.intent
        row.strengths_json = json.dumps(data.strengths)
        row.weaknesses_json = json.dumps(data.weaknesses)
        row.skills_focus_json = json.dumps(data.skills_focus)
        row.mentor_thread_json = json.dumps(
            [m.model_dump() for m in data.mentor_thread][-40:]
        )
        row.scenarios_json = json.dumps(data.scenarios)
        row.live_code_json = json.dumps(data.live_code)

    @staticmethod
    def context_to_payload(row: JobContext) -> JobContextPayload:
        def _load(raw: str, default: list) -> list:
            try:
                return json.loads(raw or "[]")
            except json.JSONDecodeError:
                return default

        from app.schemas.workspace import MentorMessageSchema

        thread_raw = _load(row.mentor_thread_json, [])
        mentor_thread = [
            MentorMessageSchema(**m) if isinstance(m, dict) else MentorMessageSchema(role="user", content=str(m))
            for m in thread_raw
        ]
        return JobContextPayload(
            context_key=row.context_key,
            application_id=row.application_id,
            company=row.company,
            role=row.role,
            intent=row.intent or "",
            strengths=_load(row.strengths_json, []),
            weaknesses=_load(row.weaknesses_json, []),
            skills_focus=_load(row.skills_focus_json, []),
            mentor_thread=mentor_thread,
            scenarios=_load(row.scenarios_json, []),
            live_code=_load(row.live_code_json, []),
        )
