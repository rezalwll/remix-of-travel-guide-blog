export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fieldErrors?: Record<string, string[]>, public requestId?: string, public details?: Record<string, unknown>) { super(message); this.name = "ApiError"; }
}

const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBase}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init.headers ?? {}) } });
  } catch {
    if (!init.method || init.method === "GET") {
      try { response = await fetch(`${apiBase}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init.headers ?? {}) } }); }
      catch { throw new ApiError(0, "API_UNAVAILABLE", "ارتباط با سرویس برقرار نشد؛ لطفاً دوباره تلاش کنید."); }
    } else throw new ApiError(0, "API_UNAVAILABLE", "ارتباط با سرویس برقرار نشد؛ لطفاً دوباره تلاش کنید.");
  }
  const body = response.status === 204 ? undefined : await response.json().catch(() => undefined);
  if (!response.ok) { const error = body?.error; throw new ApiError(response.status, error?.code ?? "REQUEST_FAILED", error?.message ?? "درخواست انجام نشد", error?.fieldErrors, error?.requestId, error?.details); }
  return body as T;
}
