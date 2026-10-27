/**
 * Contract của slice `admin/tasks` (bề mặt quản lý — Kanban & Dashboard công việc).
 *
 * Thuộc **Dev 2**. Khai báo riêng cho bề mặt quản lý theo đúng cấu trúc README & AGENTS.md.
 */

export type TaskStatus = "todo" | "in_progress" | "review" | "completed";

export type KanbanColumnId = "todo" | "in_progress" | "review" | "completed";

export type PriorityFilter = "all" | "urgent_important" | "urgent_only" | "important_only";

export type EisenhowerTab =
  | "urgent_important"
  | "urgent_not_important"
  | "not_urgent_important";

export type DisplayMode = "kanban" | "dashboard";

export type DashboardViewMode = "view" | "edit";

export interface KanbanColumnDef {
  id: KanbanColumnId;
  title: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export type AvatarType =
  | "female_dark_hair"
  | "male_glasses"
  | "female_brown_hair"
  | "male_dark_hair"
  | "male_suit"
  | "male_blonde";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  assigneeName: string;
}

export interface TaskPerson {
  name: string;
  role: string;
  avatar: AvatarType;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  urgent: boolean;
  important: boolean;
  overdue?: boolean;
  status: TaskStatus;
  progress: number;
  project: string;
  stage: string;
  departmentId: string;
  metaText: string;
  description: string;
  assignee: TaskPerson;
  assigner: TaskPerson;
  followers: TaskPerson[];
  widgetGroup: "urgent_important" | "growth_project" | "both";
  subtasks: SubTask[];
}

export interface RequestItem {
  id: string;
  prefixTag: string;
  title: string;
  subtitle: string;
  completed: boolean;
  requesterAvatar: AvatarType;
  approverAvatars: AvatarType[];
  createdAt: string;
  department: string;
  content: string;
}

export interface DepartmentReportRow {
  id: string;
  badgeLetter: "D" | "P";
  badgeColor: string;
  name: string;
  shortChartLabel: string;
  baseTotal: number;
  baseInTime: number;
  baseOverdue: number;
  baseCompleted: number;
  basePendingOther: number;
  baseWorkload: number;
  showInReportTable: boolean;
  showInWorkloadChart: boolean;
  chartOrder: number;
}

export interface ComputedDepartmentRow extends DepartmentReportRow {
  total: number;
  inTime: number;
  overdue: number;
  completed: number;
  pendingOther: number;
  workload: number;
}

export interface TaskBoardData {
  tasks: TaskItem[];
  requests: RequestItem[];
  departments: DepartmentReportRow[];
}

export interface CreateTaskPayload {
  title: string;
  columnId: KanbanColumnId;
  urgent?: boolean;
  important?: boolean;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}

export interface UpdateTaskPayload {
  description?: string;
}

export interface CreateSubTaskPayload {
  title: string;
}

export interface UpdateRequestApprovalPayload {
  completed: boolean;
}
