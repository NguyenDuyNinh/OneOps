"use client";

import React from "react";

interface TaskCommentCounterProps {
  count?: number;
  className?: string;
  onClick?: () => void;
}

export const TaskCommentCounter: React.FC<TaskCommentCounterProps> = ({
  count = 0,
  className = "",
  onClick,
}) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground transition hover:bg-muted/80 cursor-pointer ${className}`}
      title="Số lượng bình luận trao đổi"
    >
      <span>💬</span>
      <span>{count}</span>
    </span>
  );
};

export default TaskCommentCounter;
