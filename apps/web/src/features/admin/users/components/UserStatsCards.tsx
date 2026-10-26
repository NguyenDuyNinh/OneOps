import React from "react";
import type { UserStats } from "../types";

interface UserStatsCardsProps {
  stats: UserStats | null;
}

interface StatItem {
  label: string;
  value: number;
  hint: string;
}

export default function UserStatsCards({ stats }: UserStatsCardsProps) {
  const items: StatItem[] = [
    { label: "Tổng tài khoản", value: stats?.total ?? 0, hint: "Toàn bộ người dùng hệ thống" },
    { label: "Đang hoạt động", value: stats?.active ?? 0, hint: "Có thể đăng nhập" },
    { label: "Đã vô hiệu hoá", value: stats?.inactive ?? 0, hint: "Bị chặn đăng nhập" },
    { label: "Quản trị viên", value: stats?.admins ?? 0, hint: "Toàn quyền quản trị" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <p className="text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {stats === null ? "—" : item.value.toLocaleString("vi-VN")}
          </p>
          <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}
