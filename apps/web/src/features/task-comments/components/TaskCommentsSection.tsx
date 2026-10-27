'use client';

import React from 'react';
import { useTaskComments } from '../hooks/useTaskComments';
import { TaskCommentInput } from './TaskCommentInput';
import { TaskCommentList } from './TaskCommentList';

interface TaskCommentsSectionProps {
  taskId: string;
  onCommentCountChange?: (newCount: number) => void;
  className?: string;
}

export const TaskCommentsSection: React.FC<TaskCommentsSectionProps> = ({
  taskId,
  onCommentCountChange,
  className = '',
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

  const handleCommentSubmit = async (payload: Parameters<typeof submitComment>[0]) => {
    await submitComment(payload);
    onCommentCountChange?.(totalCount + 1);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
        <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <span>💬</span>
          <span>Trao đổi & Bình luận</span>
          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
            {totalCount}
          </span>
        </h3>
        <span className="text-xs text-gray-400">Gõ @ để nhắc tên đồng nghiệp</span>
      </div>

      {/* Danh sách bình luận */}
      <div className="max-h-[360px] overflow-y-auto pr-1">
        <TaskCommentList
          comments={comments}
          isLoading={isLoading}
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

