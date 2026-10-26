"use client";

import AppHeader from "@/core/layout/AppHeader";
import AppSidebar from "@/core/layout/AppSidebar";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Header tách hoàn toàn khỏi sidebar: chiếm 100% chiều rộng, nằm trên cùng.
  // Sidebar + nội dung là hàng flex BÊN DƯỚI header, mỗi cột tự cuộn riêng —
  // panel phụ sidebar mở ra vẫn PUSH nội dung (animate width trong flex).
  return (
    <div className="flex h-screen flex-col">
      <AppHeader />
      <div className="flex flex-1 items-stretch overflow-hidden">
        <AppSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="p-3 md:p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
