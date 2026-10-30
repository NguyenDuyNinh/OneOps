"use client";

import React from "react";
import { useTaskComments } from "../hooks/useTaskComments";
import { TaskCommentInput } from "./TaskCommentInput";
import { TaskCommentList } from "./TaskCommentList";

interface TaskCommentsSectionProps {
  taskId: string;
  onCommentCountChange?: (newCount: number) => void;
  canReview?: boolean;
  className?: string;
}

export const TaskCommentsSection: React.FC<TaskCommentsSectionProps> = ({
  taskId,
  onCommentCountChange,
  canReview = true,
  className = "",
}) => {
  const {
    comments,
    totalCount,
    isLoading,
    hasPendingProposal,
    submitComment,
    approveProposal,
    rejectProposal,
  } = useTaskComments(taskId);

  const handleCommentSubmit = async (
    payload: Parameters<typeof submitComment>[0],
  ) => {
    await submitComment(payload);
    onCommentCountChange?.(totalCount + 1);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="flex items-center gap-2 font-semibold text-foreground text-sm">
          <span>💬</span>
          <span>Trao đổi & Bình luận</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {totalCount}
          </span>
        </h3>
        <span className="text-xs text-muted-foreground">
          Gõ @ để nhắc tên đồng nghiệp
        </span>
      </div>

      {/* Danh sách bình luận */}
      <div className="max-h-[360px] overflow-y-auto pr-1">
        <TaskCommentList
          comments={comments}
          isLoading={isLoading}
          canReview={canReview}
          onApproveProposal={approveProposal}
          onRejectProposal={rejectProposal}
        />
      </div>

      {/* Khung nhập bình luận */}
      <TaskCommentInput
        taskId={taskId}
        hasPendingProposal={hasPendingProposal}
        onSubmit={handleCommentSubmit}
      />
    </div>
  );
};

export default TaskCommentsSection;
