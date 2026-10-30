"use client";

import React from "react";
import { Modal } from "./primitives/modal";
import { TaskCommentsSection } from "./TaskCommentsSection";

interface TaskCommentModalProps {
  taskId: string;
  taskTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountChange?: (newCount: number) => void;
  canReview?: boolean;
}

export const TaskCommentModal: React.FC<TaskCommentModalProps> = ({
  taskId,
  taskTitle,
  isOpen,
  onClose,
  onCommentCountChange,
  canReview = true,
}) => {
  if (!taskId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="flex flex-col gap-4 p-6">
        {taskTitle && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Công việc
            </span>
            <h2 className="text-base font-bold text-foreground">{taskTitle}</h2>
          </div>
        )}
        <TaskCommentsSection
          taskId={taskId}
          onCommentCountChange={onCommentCountChange}
          canReview={canReview}
        />
      </div>
    </Modal>
  );
};

export default TaskCommentModal;
