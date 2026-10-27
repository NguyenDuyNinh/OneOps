"use client";

import { AppHeader, AppSidebar } from "@/features/admin/app-shell";
import { navSections } from "@/features/admin/navigation";
import { AuthGuard } from "@/features/auth";
import { usePathname } from "next/navigation";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTasksWorkspace =
    pathname === "/admin" || pathname.startsWith("/admin/tasks");

  if (isTasksWorkspace) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  // Header tách hoàn toàn khỏi sidebar: chiếm 100% chiều rộng, nằm trên cùng.
  // Sidebar + nội dung là hàng flex BÊN DƯỚI header, mỗi cột tự cuộn riêng —
  // panel phụ sidebar mở ra vẫn PUSH nội dung (animate width trong flex).
  return (
    <AuthGuard>
      <div className="flex h-screen flex-col">
        <AppHeader />
        <div className="flex flex-1 items-stretch overflow-hidden">
          <AppSidebar sections={navSections} />
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="p-3 md:p-4">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
