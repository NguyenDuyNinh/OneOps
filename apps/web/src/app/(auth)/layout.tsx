import { GridShape, ThemeTogglerTwo } from "@/features/auth";

import Image from "next/image";
import Link from "next/link";
import React from "react";

/**
 * Layout của các trang xác thực (`/signin`, `/signup`).
 *
 * QUY TẮC: trang auth **chỉ dùng UI của `features/auth`** — không import UI/component
 * từ `features/admin/*`. Nhờ vậy bề mặt đăng nhập không bị vỡ khi admin đổi giao diện.
 *
 * `ThemeProvider` đã bọc toàn site ở `app/layout.tsx` — KHÔNG bọc lại ở đây
 * (2 provider = 2 nguồn state, theme sẽ lệch giữa các nhánh cây).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
      <div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900">
        {children}
        <div className="bg-brand-950 hidden h-full w-full items-center lg:grid lg:w-1/2 dark:bg-white/5">
          <div className="relative z-1 flex items-center justify-center">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex max-w-xs flex-col items-center">
              <Link href="/admin" className="mb-4 block">
                <Image
                  width={220}
                  height={56}
                  priority
                  src="/images/logo/logo-horizontal.webp"
                  alt="Hoàng Hà"
                />
              </Link>
              <p className="text-center text-gray-400 dark:text-white/60">
                Giải pháp quản trị số cho doanh nghiệp
              </p>
            </div>
          </div>
        </div>
        <div className="fixed right-6 bottom-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
