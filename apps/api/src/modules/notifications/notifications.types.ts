// [Dev 3] — Module Thông Báo
// Sở hữu: Dev 3 | Contract của slice này nằm ngay trong module (không còn package shared-types).
// Event payload do module phát (attendance/tasks) sở hữu; service chỉ import type để lắng nghe.

export enum NotificationType {
  // Attendance (emit bởi Dev 1, Dev 3 lắng nghe)
  ATTENDANCE_REMINDER = 'ATTENDANCE_REMINDER',
  ATTENDANCE_ABSENT_ALERT = 'ATTENDANCE_ABSENT_ALERT',

  // Tasks (emit bởi Dev 2, Dev 3 lắng nghe)
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  TASK_DEADLINE_WARNING = 'TASK_DEADLINE_WARNING',
  TASK_OVERDUE = 'TASK_OVERDUE',
  TASK_NEEDS_REASSIGNMENT = 'TASK_NEEDS_REASSIGNMENT',
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  PROPOSAL_REVIEWED = 'PROPOSAL_REVIEWED',

  // Chat
  CHAT_MENTIONED = 'CHAT_MENTIONED',
  CHAT_NEW_MESSAGE = 'CHAT_NEW_MESSAGE',

  // Leave
  LEAVE_REQUEST_CREATED = 'LEAVE_REQUEST_CREATED',
  LEAVE_REQUEST_REVIEWED = 'LEAVE_REQUEST_REVIEWED',
}

export interface Notification {
  id: string;
  userId: string;            // Người nhận
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  actionUrl?: string;        // Deep link khi click vào thông báo
  metadata?: Record<string, unknown>;  // Context data (taskId, leaveId, ...)
  createdAt: Date;
}
