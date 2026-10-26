// [Dev 2] — Module Quản Lý Công Việc & Kanban
// Sở hữu: Dev 2 | Contract của slice này nằm ngay trong module (không còn package shared-types).
// Payload request dùng class DTO (`dto/create-task.dto.ts`).

export enum TaskStatus {
  TODO = 'TODO',               // Cần làm
  IN_PROGRESS = 'IN_PROGRESS', // Đang làm
  REVIEW = 'REVIEW',           // Chờ kiểm tra
  REWORK = 'REWORK',           // Làm lại
  DONE = 'DONE',               // Hoàn thành
  PAUSED = 'PAUSED',           // Hoãn lại
  CANCELLED = 'CANCELLED',     // Đã hủy
}

export enum TaskDeadlineStatus {
  NORMAL = 'NORMAL',          // Còn > 24h
  WARNING = 'WARNING',        // Còn 0-24h (màu vàng)
  OVERDUE = 'OVERDUE',        // Đã quá hạn (màu đỏ)
}

export enum ProposalType {
  PAUSE = 'PAUSE',            // Đề xuất hoãn
  CANCEL = 'CANCEL',          // Đề xuất hủy
  CHANGE_DEADLINE = 'CHANGE_DEADLINE', // Đề xuất đổi deadline
}

export enum ProposalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  deadlineStatus: TaskDeadlineStatus;
  deadline: Date;
  assigneeId: string;          // Đúng 1 người phụ trách
  createdById: string;
  projectId?: string;
  needsReassignment: boolean;  // Cờ cần giao lại khi assignee nghỉ
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskLog {
  id: string;
  taskId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  changedById: string;
  reason?: string;
  createdAt: Date;
}

export interface TaskProposal {
  id: string;
  taskId: string;
  type: ProposalType;
  status: ProposalStatus;
  reason: string;
  proposedDeadline?: Date;     // Chỉ dùng với CHANGE_DEADLINE
  proposedById: string;
  reviewedById?: string;
  rejectionReason?: string;
  createdAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  isSystemLog: boolean;        // true = tự động ghi bởi hệ thống
  createdAt: Date;
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
  reason?: string;
}

export interface CreateProposalDto {
  type: ProposalType;
  reason: string;
  proposedDeadline?: Date;
}

// ---------------------------------------------------------------------------
// Event payload (EventEmitter2)
// Module này phát `task.created` / `task.status_changed`; gateway + notifications lắng nghe.
// ---------------------------------------------------------------------------

export interface TaskCreatedEvent {
  taskId: string;
  taskTitle: string;
  assigneeId: string;
  assignedById: string;
  deadline: Date;
}

export interface TaskStatusChangedEvent {
  taskId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  userId: string;
}

export interface TaskOverdueEvent {
  taskId: string;
  taskTitle: string;
  assigneeId: string;
  managerId: string;
  overdueMinutes: number;
}
