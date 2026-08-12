const PUBLIC_BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  "https://careerpilot-api.vercel.app";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

import { getWorkspaceId } from "@/lib/workspace-id";

/** Browser always uses same-origin /api/v1 (Next.js rewrite → FastAPI). Avoids CORS on uploads. */
function resolveApiBase(): string {
  if (typeof window !== "undefined") {
    return "/api/v1";
  }

  const explicit = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (explicit?.startsWith("http")) return explicit;

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "");
  if (backend) return `${backend}/api/v1`;

  if (process.env.NODE_ENV === "production") {
    return `${PUBLIC_BACKEND}/api/v1`;
  }

  return explicit || "/api/v1";
}

const API_BASE = resolveApiBase();

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function parseErrorMessage(res: Response, body: unknown): string {
  const error = body as { detail?: unknown; message?: string };
  const detail = error.detail ?? error.message;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(", ");
  }
  if (res.status === 413) {
    return "File too large (max 4MB). Try a smaller PDF or .docx.";
  }
  if (res.status >= 500) {
    return "Server error — please try again in a few seconds.";
  }
  return "Request failed";
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  base = API_BASE
): Promise<T> {
  const url = `${base}${endpoint}`;
  const headers = new Headers(options.headers || {});
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (typeof window !== "undefined") {
    headers.set("X-Workspace-Id", getWorkspaceId());
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      0,
      "Network error — check your connection or try again. If this persists, the API may be waking up."
    );
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, parseErrorMessage(res, error));
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

type JsonBody = unknown;

export const api = {
  get: <T>(endpoint: string, init?: RequestInit) =>
    request<T>(endpoint, { method: "GET", ...init }),
  post: <T>(endpoint: string, data: JsonBody, init?: RequestInit) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...init,
    }),
  patch: <T>(endpoint: string, data: JsonBody, init?: RequestInit) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...init,
    }),
  put: <T>(endpoint: string, data: JsonBody, init?: RequestInit) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...init,
    }),
  delete: (endpoint: string, init?: RequestInit) =>
    request<void>(endpoint, { method: "DELETE", ...init }),
  /** Same-origin upload via Next.js rewrite (works for PDF/DOCX up to 4MB) */
  upload: <T>(endpoint: string, formData: FormData, init?: RequestInit) => {
    const file = formData.get("file");
    if (file instanceof File && file.size > MAX_UPLOAD_BYTES) {
      return Promise.reject(
        new ApiError(400, "File too large (max 4MB). Export a lighter PDF or use .txt/.md.")
      );
    }
    return request<T>(endpoint, { method: "POST", body: formData, ...init });
  },
  maxUploadBytes: MAX_UPLOAD_BYTES,
};

/** Stream mentor SSE tokens; calls onChunk for each text piece. */
export async function streamMentorChat(
  payload: unknown,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_BASE}/mentor/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
    credentials: "include",
  });
  if (!res.ok || !res.body) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, parseErrorMessage(res, error));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    for (const part of parts) {
      const line = part.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.error) throw new ApiError(502, data.error);
        if (data.text) onChunk(data.text);
      } catch (err) {
        if (err instanceof ApiError) throw err;
      }
    }
  }
}
