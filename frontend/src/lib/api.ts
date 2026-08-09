const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

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
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = error.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(", ")
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
  delete: (endpoint: string, init?: RequestInit) =>
    request<void>(endpoint, { method: "DELETE", ...init }),
  upload: <T>(endpoint: string, formData: FormData, init?: RequestInit) =>
    request<T>(endpoint, { method: "POST", body: formData, ...init }),
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
