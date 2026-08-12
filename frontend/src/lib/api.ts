const PUBLIC_BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
  "https://careerpilot-api.vercel.app";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel proxy limit ~4.5MB

import { getWorkspaceId } from "@/lib/workspace-id";

/** Browser uses same-origin proxy for JSON; uploads go direct to FastAPI. */
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

function resolveUploadBase(): string {
  if (typeof window !== "undefined") {
    return `${PUBLIC_BACKEND}/api/v1`;
  }
  return resolveApiBase();
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

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: isForm && base !== API_BASE ? "omit" : "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = error.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(", ")
          : res.status === 413
            ? "File too large (max 4MB). Try a smaller PDF or .docx."
            : "Request failed";
    throw new ApiError(res.status, message);
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
  /** Direct to FastAPI — bypasses Next.js 4.5MB body limit on multipart uploads */
  upload: <T>(endpoint: string, formData: FormData, init?: RequestInit) => {
    if (typeof window !== "undefined") {
      const file = formData.get("file");
      if (file instanceof File && file.size > MAX_UPLOAD_BYTES) {
        return Promise.reject(
          new ApiError(400, "File too large (max 4MB). Export a lighter PDF or use .txt/.md.")
        );
      }
    }
    const uploadInit: RequestInit = { method: "POST", body: formData, ...init };
    if (typeof window !== "undefined") {
      const headers = new Headers(uploadInit.headers || {});
      headers.set("X-Workspace-Id", getWorkspaceId());
      uploadInit.headers = headers;
    }
    return request<T>(
      endpoint,
      uploadInit,
      typeof window !== "undefined" ? resolveUploadBase() : API_BASE
    );
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
    throw new ApiError(res.status, error.detail || "Stream failed");
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
