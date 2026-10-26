export declare enum NotificationType {
    ATTENDANCE_REMINDER = "ATTENDANCE_REMINDER",
    ATTENDANCE_ABSENT_ALERT = "ATTENDANCE_ABSENT_ALERT",
    TASK_ASSIGNED = "TASK_ASSIGNED",
    TASK_STATUS_CHANGED = "TASK_STATUS_CHANGED",
    TASK_DEADLINE_WARNING = "TASK_DEADLINE_WARNING",
    TASK_OVERDUE = "TASK_OVERDUE",
    TASK_NEEDS_REASSIGNMENT = "TASK_NEEDS_REASSIGNMENT",
    PROPOSAL_CREATED = "PROPOSAL_CREATED",
    PROPOSAL_REVIEWED = "PROPOSAL_REVIEWED",
    CHAT_MENTIONED = "CHAT_MENTIONED",
    CHAT_NEW_MESSAGE = "CHAT_NEW_MESSAGE",
    LEAVE_REQUEST_CREATED = "LEAVE_REQUEST_CREATED",
    LEAVE_REQUEST_REVIEWED = "LEAVE_REQUEST_REVIEWED"
}
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    isRead: boolean;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}
export interface TaskAssignedEvent {
    taskId: string;
    taskTitle: string;
    assigneeId: string;
    assignedById: string;
    deadline: Date;
}
export interface TaskOverdueEvent {
    taskId: string;
    taskTitle: string;
    assigneeId: string;
    managerId: string;
    overdueMinutes: number;
}
export interface AttendanceCheckedInEvent {
    userId: string;
    attendanceId: string;
    status: string;
    checkedInAt: Date;
}
