import { TasksScreen } from "@/features/admin/tasks";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "OneOps | Quản trị Công việc & Kanban",
  description: "Bảng điều khiển quản lý công việc, phê duyệt đề xuất và theo dõi hiệu suất phòng ban",
};

/** Trang chủ khu vực quản trị & quản lý — điểm đến sau khi đăng nhập. */
export default function AdminHomePage() {
  return <TasksScreen defaultMode="kanban" />;
}
