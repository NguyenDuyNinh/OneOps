export type CommentType = "COMMENT" | "DEADLINE_PROPOSAL";
export type ProposalStatus = "PENDING" | "APPROVED" | "REJECTED";

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
  avatarUrl?: string | null;
  role: string;
}

export interface TaskCommentItem {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  type: string;
  mentions: string[];
  links: string[];
  attachments?: TaskCommentAttachment[] | null;
  proposedDeadline?: Date | string | null;
  proposalStatus?: string | null;
  reviewedById?: string | null;
  rejectionReason?: string | null;
  isSystemLog: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
  author?: TaskCommentAuthor;
  mentionedUsers?: TaskCommentAuthor[];
}

export type SystemLogAction = "PAUSE" | "CANCEL" | "REWORK" | "REASSIGN";

export interface PaginatedTaskComments {
  items: TaskCommentItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
