/**
 * Lưu trữ phiên đăng nhập phía client.
 *
 * - "Ghi nhớ đăng nhập" → localStorage (sống qua lần đóng trình duyệt).
 * - Không ghi nhớ        → sessionStorage (mất khi đóng tab).
 * - Cookie đồng bộ cùng token để tầng server/middleware sau này có thể đọc.
 *
 * Token là JWT nên chỉ lưu ở client; mọi request đính kèm qua Authorization header.
 */

import type { AuthenticatedUser } from "@oneops/shared-types";

const TOKEN_KEY = "oneops.accessToken";
const USER_KEY = "oneops.user";
const COOKIE_NAME = "oneops_token";

const REMEMBER_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export interface StoredSession {
  accessToken: string;
  user: AuthenticatedUser;
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.role === "string"
  );
}

function writeCookie(token: string, remember: boolean): void {
  if (typeof document === "undefined") return;
  const maxAge = remember ? `; max-age=${REMEMBER_MAX_AGE_SECONDS}` : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; samesite=lax${maxAge}`;
}

function clearCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

/** Lưu phiên sau khi đăng nhập thành công. */
export function saveSession(session: StoredSession, remember: boolean): void {
  const target = remember ? getLocalStorage() : getSessionStorage();
  const other = remember ? getSessionStorage() : getLocalStorage();

  try {
    other?.removeItem(TOKEN_KEY);
    other?.removeItem(USER_KEY);
    target?.setItem(TOKEN_KEY, session.accessToken);
    target?.setItem(USER_KEY, JSON.stringify(session.user));
  } catch {
    // Storage bị chặn (chế độ riêng tư) — cookie vẫn giữ được token cho luồng hiện tại.
  }

  writeCookie(session.accessToken, remember);
}

/** Đọc phiên hiện tại, ưu tiên sessionStorage (phiên ngắn hạn) trước localStorage. */
export function readSession(): StoredSession | null {
  const stores = [getSessionStorage(), getLocalStorage()];

  for (const store of stores) {
    if (!store) continue;
    try {
      const accessToken = store.getItem(TOKEN_KEY);
      const rawUser = store.getItem(USER_KEY);
      if (!accessToken || !rawUser) continue;

      const parsedUser: unknown = JSON.parse(rawUser);
      if (!isAuthenticatedUser(parsedUser)) continue;

      return { accessToken, user: parsedUser };
    } catch {
      // Dữ liệu hỏng — bỏ qua và thử store tiếp theo.
    }
  }

  return null;
}

export function getAccessToken(): string | null {
  return readSession()?.accessToken ?? null;
}

export function getCurrentUser(): AuthenticatedUser | null {
  return readSession()?.user ?? null;
}

export function isAuthenticated(): boolean {
  return readSession() !== null;
}

/** Xoá toàn bộ dấu vết phiên (dùng khi token hết hạn hoặc 401). */
export function clearSession(): void {
  for (const store of [getLocalStorage(), getSessionStorage()]) {
    try {
      store?.removeItem(TOKEN_KEY);
      store?.removeItem(USER_KEY);
    } catch {
      // Bỏ qua: storage không truy cập được thì không có gì để xoá.
    }
  }
  clearCookie();
}
