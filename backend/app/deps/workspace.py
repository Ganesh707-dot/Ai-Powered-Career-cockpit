from fastapi import Header

DEFAULT_WORKSPACE = "default"


def get_workspace_id(
    x_workspace_id: str | None = Header(default=None, alias="X-Workspace-Id"),
) -> str:
    """Scope all workspace data to a stable client id (sent on every API call)."""
    if x_workspace_id and x_workspace_id.strip():
        return x_workspace_id.strip()[:64]
    return DEFAULT_WORKSPACE
