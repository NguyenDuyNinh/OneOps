export declare enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    REVIEW = "REVIEW",
    REWORK = "REWORK",
    DONE = "DONE",
    PAUSED = "PAUSED",
    CANCELLED = "CANCELLED"
}
export declare enum TaskDeadlineStatus {
    NORMAL = "NORMAL",
    WARNING = "WARNING",
    OVERDUE = "OVERDUE"
}
export declare enum ProposalType {
    PAUSE = "PAUSE",
    CANCEL = "CANCEL",
    CHANGE_DEADLINE = "CHANGE_DEADLINE"
}
export declare enum ProposalStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    deadlineStatus: TaskDeadlineStatus;
    deadline: Date;
    assigneeId: string;
    createdById: string;
    projectId?: string;
    needsReassignment: boolean;
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
    proposedDeadline?: Date;
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
    isSystemLog: boolean;
    createdAt: Date;
}
export interface CreateTaskDto {
    title: string;
    description?: string;
    deadline: Date;
    assigneeId: string;
    projectId?: string;
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
