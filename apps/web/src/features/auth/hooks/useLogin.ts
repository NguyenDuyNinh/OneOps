"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { LoginDto } from "../types";
import { authApi } from "../api/auth.api";
import { saveSession } from "../lib/auth-storage";
import { ApiError } from "../lib/api-client";

const DEFAULT_REDIRECT = "/admin";
const CONNECTION_ERROR_MESSAGE =
  "Không thể kết nối tới máy chủ. Vui lòng kiểm tra đường truyền và thử lại.";

/** Chỉ chấp nhận đường dẫn nội bộ — chặn open-redirect qua `?next=`. */
function resolveRedirectTarget(): string {
  if (typeof window === "undefined") return DEFAULT_REDIRECT;

  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return DEFAULT_REDIRECT;
  return next;
}

export function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = useCallback(
    async (dto: LoginDto, remember: boolean): Promise<boolean> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const session = await authApi.login(dto);
        saveSession(session, remember);
        router.replace(resolveRedirectTarget());
        router.refresh();
        return true;
      } catch (error) {
        setErrorMessage(
          error instanceof ApiError ? error.detail : CONNECTION_ERROR_MESSAGE,
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return { login, isLoading, errorMessage };
}
