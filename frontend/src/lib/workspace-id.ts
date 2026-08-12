const WORKSPACE_KEY = "careerpilot-workspace-id";

/** Stable workspace id — only identity in browser; all data lives in Postgres via API. */
export function getWorkspaceId(): string {
  if (typeof window === "undefined") return "default";
  let id = localStorage.getItem(WORKSPACE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ws-${Date.now()}`;
    localStorage.setItem(WORKSPACE_KEY, id);
  }
  return id;
}
