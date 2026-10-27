'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { TaskCommentsSection } from './TaskCommentsSection';

interface TaskCommentModalProps {
  taskId: string;
  taskTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountChange?: (newCount: number) => void;
}

export const TaskCommentModal: React.FC<TaskCommentModalProps> = ({
  taskId,
  taskTitle,
  isOpen,
  onClose,
  onCommentCountChange,
}) => {
  if (!taskId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="flex flex-col gap-4 p-6">
        {taskTitle && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Công việc
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {taskTitle}
            </h2>
          </div>
        )}
        <TaskCommentsSection
          taskId={taskId}
          onCommentCountChange={onCommentCountChange}
        />
      </div>
    </Modal>
  );
};

