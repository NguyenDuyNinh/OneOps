import type { KanbanColumnDef, KanbanColumnId } from "./types";

export const TASKS_ROUTE = "/admin/tasks";

export const KANBAN_COLUMNS: KanbanColumnDef[] = [
  {
    id: "todo",
    title: "CẦN LÀM (TO DO)",
    accentColor: "#3B73B9",
    badgeBg: "#EBF3FA",
    badgeText: "#1D509E",
  },
  {
    id: "in_progress",
    title: "ĐANG LÀM (IN PROGRESS)",
    accentColor: "#F59E0B",
    badgeBg: "#FEF3C7",
    badgeText: "#B45309",
  },
  {
    id: "review",
    title: "CHỜ DUYỆT (IN REVIEW)",
    accentColor: "#8B5CF6",
    badgeBg: "#F3E8FF",
    badgeText: "#6D28D9",
  },
  {
    id: "completed",
    title: "HOÀN THÀNH (DONE)",
    accentColor: "#22C55E",
    badgeBg: "#DCFCE7",
    badgeText: "#15803D",
  },
];

export const COLUMN_ORDER: KanbanColumnId[] = ["todo", "in_progress", "review", "completed"];
