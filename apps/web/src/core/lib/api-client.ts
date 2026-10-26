/**
 * API client chuẩn hóa cho phía client.
 *
 * - Base URL lấy từ `NEXT_PUBLIC_API_BASE_URL` (fallback `/api`).
 * - Error thống nhất qua `ApiError` — không bao giờ trả lỗi thẳng từ fetch.
 * - Typed: mọi caller định nghĩa T là shape response.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown, message?: string) {
    super(message ?? `API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await safeJson(res));
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiClient<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiClient<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiClient<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiClient<T>(path, { method: "DELETE" }),
};
