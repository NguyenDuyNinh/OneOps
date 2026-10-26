/**
 * API client chuẩn hóa cho phía client.
 *
 * - Base URL lấy từ `NEXT_PUBLIC_API_BASE_URL` (fallback local API).
 * - Tự đính kèm Bearer token của phiên đăng nhập.
 * - Error thống nhất qua `ApiError` — không bao giờ trả lỗi thẳng từ fetch.
 * - 401 → xoá phiên và điều hướng về trang đăng nhập.
 */

import { clearSession, getAccessToken } from "./auth-storage";
import { DEFAULT_API_BASE_URL } from "./constants";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const SIGN_IN_PATH = "/signin";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown, message?: string) {
    super(message ?? `API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }

  /** Câu thông báo thân thiện lấy từ payload lỗi của NestJS. */
  get detail(): string {
    return extractMessage(this.payload) ?? this.message;
  }
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function extractMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const { message } = payload as { message?: unknown };

  if (typeof message === "string" && message.length > 0) return message;
  if (Array.isArray(message)) {
    const joined = message.filter((item): item is string => typeof item === "string").join("\n");
    return joined.length > 0 ? joined : null;
  }
  return null;
}

function redirectToSignIn(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === SIGN_IN_PATH) return;

  const currentPath = `${window.location.pathname}${window.location.search}`;
  window.location.href = `${SIGN_IN_PATH}?next=${encodeURIComponent(currentPath)}`;
}

function buildHeaders(init?: RequestInit): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init?.headers,
  };
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });

  if (!res.ok) {
    const payload = await safeJson(res);

    if (res.status === 401) {
      clearSession();
      redirectToSignIn();
    }

    throw new ApiError(res.status, payload, extractMessage(payload) ?? undefined);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiClient<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiClient<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiClient<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiClient<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiClient<T>(path, { method: "DELETE" }),
};
