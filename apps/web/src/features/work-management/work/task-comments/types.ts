export type CommentType = "COMMENT" | "DEADLINE_PROPOSAL";

export type ProposalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TaskCommentUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  role?: string;
}

export interface TaskCommentAttachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  type: CommentType | string;
  mentions: string[];
  links: string[];
  attachments?: TaskCommentAttachment[] | null;
  proposedDeadline?: string | null;
  proposalStatus?: ProposalStatus | string | null;
  reviewedById?: string | null;
  rejectionReason?: string | null;
  isSystemLog: boolean;
  createdAt: string;
  updatedAt?: string;
  author?: TaskCommentUser;
  mentionedUsers?: TaskCommentUser[];
  // Legacy backward-compatibility fields:
  text?: string;
}

export interface LegacyTaskComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface CreateCommentPayload {
  content: string;
  type?: CommentType;
  mentions?: string[];
  links?: string[];
  attachments?: TaskCommentAttachment[];
  proposedDeadline?: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
}

export interface PaginatedComments {
  items: TaskComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MentionableUser {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
}

/** Legacy type for compatibility with tasks fields.comments */
export type TaskCommentLegacy = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};
