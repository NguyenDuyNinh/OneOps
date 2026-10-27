import { CommentType, ProposalStatus } from '@prisma/client';

export { CommentType, ProposalStatus };

export interface TaskCommentAttachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface TaskCommentAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

export interface TaskCommentItem {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  type: CommentType;
  mentions: string[];
  links: string[];
  attachments?: TaskCommentAttachment[] | null;
  proposedDeadline?: Date | null;
  proposalStatus?: ProposalStatus | null;
  reviewedById?: string | null;
  rejectionReason?: string | null;
  isSystemLog: boolean;
  createdAt: Date;
  author?: TaskCommentAuthor;
  mentionedUsers?: TaskCommentAuthor[];
}

export interface TaskCommentedEvent {
  taskId: string;
  taskTitle: string;
  commentId: string;
  authorId: string;
  authorName: string;
  content: string;
  mentions: string[];
  type: CommentType;
}

export interface DeadlineProposalReviewedEvent {
  taskId: string;
  commentId: string;
  status: ProposalStatus;
  reviewedById: string;
  reviewedByName: string;
  newDeadline?: Date;
  rejectionReason?: string;
}

export type SystemLogAction = 'PAUSE' | 'CANCEL' | 'REWORK' | 'REASSIGN';

export interface TaskReassignedEvent {
  taskId: string;
  previousAssigneeId?: string;
  newAssigneeId: string;
  reassignedById: string;
  reason?: string;
}

export interface PaginatedTaskComments {
  items: TaskCommentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

