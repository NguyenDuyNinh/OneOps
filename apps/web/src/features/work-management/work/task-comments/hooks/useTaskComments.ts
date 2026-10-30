"use client";

import { useCallback, useEffect, useState } from "react";
import { taskCommentsApi } from "../api/task-comments.api";
import type { CreateCommentPayload, TaskComment } from "../types";

export function useTaskComments(taskId: string) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(() => {
    if (!taskId) return;
    taskCommentsApi
      .getComments(taskId, 1, 100)
      .then((res) => {
        setComments(res.items);
        setTotalCount(res.pagination.total);
        setError(null);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách bình luận",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const submitComment = useCallback(
    async (payload: CreateCommentPayload): Promise<TaskComment> => {
      const newComment = await taskCommentsApi.createComment(taskId, payload);
      setComments((prev) => [...prev, newComment]);
      setTotalCount((prev) => prev + 1);
      return newComment;
    },
    [taskId],
  );

  const approveProposal = useCallback(
    async (commentId: string): Promise<void> => {
      await taskCommentsApi.approveDeadlineProposal(taskId, commentId);
      fetchComments();
    },
    [taskId, fetchComments],
  );

  const rejectProposal = useCallback(
    async (commentId: string, reason: string): Promise<void> => {
      await taskCommentsApi.rejectDeadlineProposal(taskId, commentId, reason);
      fetchComments();
    },
    [taskId, fetchComments],
  );

  const hasPendingProposal = comments.some(
    (c) => c.type === "DEADLINE_PROPOSAL" && c.proposalStatus === "PENDING",
  );

  return {
    comments,
    totalCount,
    isLoading,
    error,
    hasPendingProposal,
    fetchComments,
    submitComment,
    approveProposal,
    rejectProposal,
  };
}
