"use client";

import React, { useEffect, useState } from "react";
import type { EisenhowerTab, KanbanColumnId } from "../types";
import { X } from "../ui/icons";

interface CreateTaskModalProps {
  open: boolean;
  defaultPriorityTab?: EisenhowerTab;
  onClose: () => void;
  onCreateTask: (
    columnId: KanbanColumnId,
    title: string,
    urgent: boolean,
    important: boolean,
  ) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  defaultPriorityTab = "urgent_important",
  onClose,
  onCreateTask,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskColumn, setNewTaskColumn] = useState<KanbanColumnId>("todo");
  const [priorityGroup, setPriorityGroup] =
    useState<EisenhowerTab>(defaultPriorityTab);

  useEffect(() => {
    if (open) {
      setPriorityGroup(defaultPriorityTab);
    }
  }, [open, defaultPriorityTab]);

  if (!open) return null;

  const handleModalCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const urgent =
      priorityGroup === "urgent_important" ||
      priorityGroup === "urgent_not_important";
    const important =
      priorityGroup === "urgent_important" ||
      priorityGroup === "not_urgent_important";
    onCreateTask(newTaskColumn, newTaskTitle, urgent, important);
    setNewTaskTitle("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-modal-title"
      className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-[4px] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[42px] bg-[#14499D] text-white px-4 flex items-center justify-between">
          <span id="add-task-modal-title" className="text-[14px] font-semibold">
            Tạo công việc mới trên bảng Kanban
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại tạo công việc"
            className="text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleModalCreateTask} className="p-5 space-y-4">
          <div>
            <label
              htmlFor="new-task-title"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Tên công việc
            </label>
            <input
              id="new-task-title"
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Nhập tên công việc cần thực hiện..."
              className="w-full h-9 px-3 text-xs border border-gray-300 rounded outline-none focus:border-[#14499D]"
            />
          </div>

          <div>
            <label
              htmlFor="new-task-column"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Cột trạng thái Kanban
            </label>
            <select
              id="new-task-column"
              value={newTaskColumn}
              onChange={(e) => setNewTaskColumn(e.target.value as KanbanColumnId)}
              className="w-full h-9 px-3 text-xs border border-gray-300 rounded outline-none focus:border-[#14499D] bg-white"
            >
              <option value="todo">CẦN LÀM (TO DO)</option>
              <option value="in_progress">ĐANG LÀM (IN PROGRESS)</option>
              <option value="review">CHỜ DUYỆT (IN REVIEW)</option>
              <option value="completed">HOÀN THÀNH (DONE)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="new-task-priority"
              className="block text-xs font-semibold text-gray-700 mb-1"
            >
              Phân nhóm ưu tiên (Ma trận Eisenhower)
            </label>
            <select
              id="new-task-priority"
              value={priorityGroup}
              onChange={(e) => setPriorityGroup(e.target.value as EisenhowerTab)}
              className="w-full h-9 px-3 text-xs border border-gray-300 rounded outline-none focus:border-[#14499D] bg-white"
            >
              <option value="urgent_important">Khẩn Cấp & Quan Trọng</option>
              <option value="urgent_not_important">
                Khẩn cấp & Không quan trọng
              </option>
              <option value="not_urgent_important">
                Không khẩn Cấp & Quan trọng
              </option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#14499D] rounded hover:bg-[#103B82] cursor-pointer"
            >
              Tạo thẻ công việc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
