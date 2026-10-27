import { api } from '@/features/auth';
import type {
  CreateCommentPayload,
  MentionableUser,
  PaginatedComments,
  TaskComment,
} from '../types';

export const taskCommentsApi = {
  getComments: (taskId: string, page = 1, limit = 50): Promise<PaginatedComments> => {
    return api.get<PaginatedComments>(`/tasks/${taskId}/comments?page=${page}&limit=${limit}`);
  },

  createComment: (taskId: string, payload: CreateCommentPayload): Promise<TaskComment> => {
    return api.post<TaskComment>(`/tasks/${taskId}/comments`, payload);
  },

  approveDeadlineProposal: (
    taskId: string,
    commentId: string,
  ): Promise<{ comment: TaskComment; task: unknown }> => {
    return api.patch<{ comment: TaskComment; task: unknown }>(
      `/tasks/${taskId}/comments/${commentId}/deadline-proposal/approve`,
      {},
    );
  },

  rejectDeadlineProposal: (
    taskId: string,
    commentId: string,
    reason: string,
  ): Promise<{ comment: TaskComment; task: unknown }> => {
    return api.patch<{ comment: TaskComment; task: unknown }>(
      `/tasks/${taskId}/comments/${commentId}/deadline-proposal/reject`,
      { reason },
    );
  },

  getCommentCount: (taskId: string): Promise<{ taskId: string; count: number }> => {
    return api.get<{ taskId: string; count: number }>(`/tasks/${taskId}/comments/count`);
  },

  getMentionableUsers: (): Promise<MentionableUser[]> => {
    return api.get<MentionableUser[]>('/tasks/mentionable-users');
  },
};

