"use client";

import { PieChartIcon, TaskIcon } from "@/icons";
import type { NavSection } from "@/features/admin/navigation";
import { TASKS_ROUTE } from "./constants";

/**
 * Navigation của module "Quản lý công việc & Kanban" (Dev 2).
 *
 * `scripts/gen-nav.mjs` tự quét thư mục và ráp vào `navigation/generated.ts`.
 */
export const tasksNav: NavSection = {
  name: "Tasks",
  icon: <TaskIcon />,
  path: TASKS_ROUTE,
  items: [
    { name: "Bảng Kanban", path: TASKS_ROUTE, icon: <TaskIcon />, pro: false },
    { name: "Dashboard quản lý", path: "/admin", icon: <PieChartIcon />, pro: false },
  ],
};

