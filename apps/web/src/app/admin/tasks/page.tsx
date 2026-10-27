import { TasksScreen } from "@/features/admin/tasks";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Quản lý công việc & Kanban | OneOps",
  description: "Bảng Kanban, phân công nhiệm vụ và theo dõi tiến độ dự án",
};

export default function AdminTasksPage() {
  return <TasksScreen defaultMode="kanban" />;
}

