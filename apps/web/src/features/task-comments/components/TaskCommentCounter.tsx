'use client';

import React from 'react';

interface TaskCommentCounterProps {
  count?: number;
  className?: string;
  onClick?: () => void;
}

export const TaskCommentCounter: React.FC<TaskCommentCounterProps> = ({
  count = 0,
  className = '',
  onClick,
}) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 transition hover:bg-brand-50 hover:text-brand-600 dark:bg-gray-800 dark:text-gray-300 ${className}`}
      title="Số lượng bình luận trao đổi"
    >
      <span>💬</span>
      <span>{count}</span>
    </span>
  );
};

