import { apiRequest } from "./http";
import type {
  CreateCommentPayload,
  MentionableUser,
  PaginatedComments,
  TaskComment,
} from "../types";

export const taskCommentsApi = {
  getComments: (
    taskId: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedComments> => {
    return apiRequest<PaginatedComments>(
      `/tasks/${encodeURIComponent(taskId)}/comments?page=${page}&limit=${limit}`,
    );
  },

  createComment: (
    taskId: string,
    payload: CreateCommentPayload,
  ): Promise<TaskComment> => {
    return apiRequest<TaskComment>(
      `/tasks/${encodeURIComponent(taskId)}/comments`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  approveDeadlineProposal: (
    taskId: string,
    commentId: string,
    reviewerName = "Hoàng Tuấn Bảo",
  ): Promise<{ comment: TaskComment; newDeadline: string }> => {
    return apiRequest<{ comment: TaskComment; newDeadline: string }>(
      `/tasks/${encodeURIComponent(taskId)}/comments/${encodeURIComponent(commentId)}/deadline-proposal/approve`,
      {
        method: "PATCH",
        body: JSON.stringify({ reviewerName }),
      },
    );
  },

  rejectDeadlineProposal: (
    taskId: string,
    commentId: string,
    reason: string,
    reviewerName = "Hoàng Tuấn Bảo",
  ): Promise<{ comment: TaskComment }> => {
    return apiRequest<{ comment: TaskComment }>(
      `/tasks/${encodeURIComponent(taskId)}/comments/${encodeURIComponent(commentId)}/deadline-proposal/reject`,
      {
        method: "PATCH",
        body: JSON.stringify({ reason, reviewerName }),
      },
    );
  },

  getCommentCount: (
    taskId: string,
  ): Promise<{ taskId: string; count: number }> => {
    return apiRequest<{ taskId: string; count: number }>(
      `/tasks/${encodeURIComponent(taskId)}/comments/count`,
    );
  },

  getMentionableUsers: (): Promise<MentionableUser[]> => {
    return apiRequest<MentionableUser[]>("/tasks/mentionable-users");
  },

  recordSystemLog: (
    taskId: string,
    payload: {
      action: "PAUSE" | "CANCEL" | "REWORK" | "REASSIGN";
      reason?: string;
      newAssigneeId?: string;
      newAssigneeName?: string;
      authorName?: string;
    },
  ): Promise<TaskComment> => {
    return apiRequest<TaskComment>(
      `/tasks/${encodeURIComponent(taskId)}/comments/system-log`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },
};

export const client = taskCommentsApi;
