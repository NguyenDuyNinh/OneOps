"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../lib/auth-storage";

/**
 * Chặn render nội dung được bảo vệ khi chưa đăng nhập.
 * Kiểm tra ở client vì token lưu trong storage; 401 từ API vẫn được api-client xử lý.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setIsAllowed(true);
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;
    router.replace(`/signin?next=${encodeURIComponent(currentPath)}`);
  }, [router]);

  if (!isAllowed) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span
          role="status"
          aria-label="Đang kiểm tra phiên đăng nhập"
          className="border-brand-500 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        />
      </div>
    );
  }

  return <>{children}</>;
}
