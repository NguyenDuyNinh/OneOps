export type CommentType = 'COMMENT' | 'DEADLINE_PROPOSAL';

export type ProposalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
  type: CommentType;
  mentions: string[];
  links: string[];
  attachments?: TaskCommentAttachment[] | null;
  proposedDeadline?: string | null;
  proposalStatus?: ProposalStatus | null;
  reviewedById?: string | null;
  rejectionReason?: string | null;
  isSystemLog: boolean;
  createdAt: string;
  author?: TaskCommentUser;
  mentionedUsers?: TaskCommentUser[];
}

export interface CreateCommentPayload {
  content: string;
  type?: CommentType;
  mentions?: string[];
  links?: string[];
  attachments?: TaskCommentAttachment[];
  proposedDeadline?: string;
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

