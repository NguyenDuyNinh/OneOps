"use client";

import React, { useState } from "react";
import { COLUMN_ORDER, KANBAN_COLUMNS } from "../constants";
import { filterTasksForKanbanColumn } from "../lib/board";
import type {
  KanbanColumnId,
  PriorityFilter,
  RequestItem,
  TaskItem,
} from "../types";
import { BaseAvatar } from "../ui/Avatar";
import { RequestBadgeIcon } from "../ui/Badges";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  GripVertical,
  MoreHorizontal,
  Plus,
} from "../ui/icons";

interface KanbanBoardViewProps {
  tasks: TaskItem[];
  requests: RequestItem[];
  searchQuery: string;
  priorityFilter: PriorityFilter;
  onToggleTask: (taskId: string) => void;
  onMoveTask: (taskId: string, targetColumn: KanbanColumnId) => void;
  onCreateTask: (columnId: KanbanColumnId, title: string) => void;
  onSelectTask: (task: TaskItem) => void;
  onToggleRequest: (reqId: string) => void;
  onSelectRequest: (req: RequestItem) => void;
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  tasks,
  requests,
  searchQuery,
  priorityFilter,
  onToggleTask,
  onMoveTask,
  onCreateTask,
  onSelectTask,
  onToggleRequest,
  onSelectRequest,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumnId | null>(null);
  const [addingInColumn, setAddingInColumn] = useState<KanbanColumnId | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: KanbanColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColId: KanbanColumnId) => {
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveTask(taskId, targetColId);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleOpenInlineAdd = (colId: KanbanColumnId) => {
    setAddingInColumn(colId);
    setNewCardTitle("");
  };

  const handleInlineAddSubmit = (e: React.FormEvent, colId: KanbanColumnId) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    onCreateTask(colId, newCardTitle);
    setNewCardTitle("");
    setAddingInColumn(null);
  };

  const pendingRequests = requests.filter((r) => !r.completed);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3.5">
      {/* 4-Column Kanban Board */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3.5 overflow-x-auto md:grid-cols-2 xl:grid-cols-4">
        {KANBAN_COLUMNS.map((col, colIndex) => {
          const colTasks = filterTasksForKanbanColumn(
            tasks,
            col.id,
            searchQuery,
            priorityFilter,
          );
          const isDragOver = dragOverColumn === col.id;
          const prevCol = colIndex > 0 ? COLUMN_ORDER[colIndex - 1] : null;
          const nextCol =
            colIndex < COLUMN_ORDER.length - 1 ? COLUMN_ORDER[colIndex + 1] : null;

          return (
            <section
              key={col.id}
              aria-label={col.title}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ borderTopColor: col.accentColor }}
              className={`flex min-h-0 flex-col rounded-[6px] border border-t-[3px] border-[#DFE1E6] bg-[#EBECF0]/85 transition-colors ${
                isDragOver ? "bg-blue-50/50 ring-2 ring-[#14499D]" : ""
              }`}
            >
              {/* Column Header */}
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E5E7EB] bg-white px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    style={{ backgroundColor: col.accentColor }}
                    className="h-2 w-2 shrink-0 rounded-full"
                  />
                  <h2 className="truncate text-[12px] font-bold tracking-tight text-[#172B4D] uppercase">
                    {col.title}
                  </h2>
                  <span
                    style={{
                      backgroundColor: col.badgeBg,
                      color: col.badgeText,
                    }}
                    className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
                  >
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenInlineAdd(col.id)}
                    aria-label={`Thêm nhanh vào ${col.title}`}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#14499D]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Tùy chọn cột ${col.title}`}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards Container */}
              <div className="custom-scrollbar flex-1 space-y-2.5 overflow-y-auto p-2.5">
                {addingInColumn === col.id && (
                  <form
                    onSubmit={(e) => handleInlineAddSubmit(e, col.id)}
                    className="space-y-2 rounded-[5px] border border-[#14499D] bg-white p-2.5 shadow-sm"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Nhập tên công việc mới..."
                      aria-label={`Tên công việc mới trong ${col.title}`}
                      className="w-full text-[12.5px] text-gray-800 placeholder-gray-400 outline-none"
                    />
                    <div className="flex items-center justify-end gap-1.5 border-t border-gray-100 pt-1">
                      <button
                        type="button"
                        onClick={() => setAddingInColumn(null)}
                        className="cursor-pointer rounded px-2.5 py-1 text-[11px] text-gray-600 hover:bg-gray-100"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="cursor-pointer rounded bg-[#14499D] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#103B82]"
                      >
                        Thêm thẻ
                      </button>
                    </div>
                  </form>
                )}

                {colTasks.map((task) => {
                  const isCompleted = task.status === "completed";

                  return (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="group flex flex-col gap-2 rounded-[5px] border border-[#E2E4E9] bg-white p-3 shadow-[0_1px_2px_rgba(9,30,66,0.06)] transition-all hover:border-[#94A3B8]"
                    >
                      {/* Top Priority Tags + Stage Badge */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex flex-wrap items-center gap-1">
                          {task.urgent && (
                            <span className="rounded-full bg-[#DF6A6A] px-2 py-[1px] text-[10px] leading-tight font-medium text-white">
                              Khẩn cấp
                            </span>
                          )}
                          {task.important && (
                            <span className="rounded-full bg-[#57BB63] px-2 py-[1px] text-[10px] leading-tight font-medium text-white">
                              Quan trọng
                            </span>
                          )}
                          {task.overdue && !isCompleted && (
                            <span className="flex items-center gap-0.5 rounded-full bg-[#E89B4C] px-2 py-[1px] text-[10px] leading-tight font-medium text-white">
                              <AlertCircle className="h-2.5 w-2.5" />
                              Quá hạn
                            </span>
                          )}
                          {!task.urgent && !task.important && (
                            <span className="text-[10px] font-medium text-gray-500">
                              {task.stage}
                            </span>
                          )}
                        </div>

                        <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>

                      {/* Card Title + Checkbox Row */}
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          aria-label={`Đánh dấu hoàn thành ${task.title}`}
                          className={`mt-0.5 flex h-[17px] w-[17px] shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
                            isCompleted
                              ? "border-[#57BB63] bg-[#57BB63] text-white"
                              : "border-gray-300 bg-white hover:border-[#57BB63]"
                          }`}
                        >
                          {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className={`cursor-pointer text-left text-[12.5px] leading-snug font-semibold transition-colors ${
                            isCompleted
                              ? "text-gray-500 line-through"
                              : "text-[#172B4D] hover:text-[#14499D]"
                          }`}
                        >
                          {task.title}
                        </button>
                      </div>

                      {/* Project & Stage Breadcrumb */}
                      <div className="flex items-center gap-1 truncate text-[11px] text-[#6B7280]">
                        <FolderKanban className="h-3 w-3 shrink-0 text-[#2E699E]" />
                        <span className="truncate">{task.project}</span>
                        <span>·</span>
                        <span className="shrink-0 font-medium text-[#2E699E]">
                          {task.stage}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            style={{
                              width: `${task.progress}%`,
                              backgroundColor: isCompleted ? "#22C55E" : col.accentColor,
                            }}
                            className="h-full rounded-full transition-all duration-300"
                          />
                        </div>
                        <span className="text-[10.5px] font-medium text-gray-500 tabular-nums">
                          {task.progress}%
                        </span>
                      </div>

                      {/* Card Footer: Due Date, Subtasks, Quick Move & Assignee Avatar */}
                      <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 tabular-nums">
                          {task.dueDate ? (
                            <span
                              className={`inline-flex items-center gap-1 ${
                                task.overdue && !isCompleted
                                  ? "font-semibold text-[#DC2626]"
                                  : "text-gray-500"
                              }`}
                            >
                              <Calendar className="h-3 w-3" />
                              {task.dueDate}
                            </span>
                          ) : (
                            <span className="text-gray-400">Chưa đặt hạn</span>
                          )}

                          {task.subtasks.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-gray-500">
                              <CheckSquare className="h-3 w-3" />
                              {task.subtasks.length}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {prevCol && (
                              <button
                                type="button"
                                onClick={() => onMoveTask(task.id, prevCol)}
                                aria-label={`Chuyển ${task.title} sang cột trước`}
                                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-gray-200 text-gray-500 transition-colors hover:border-[#14499D] hover:text-[#14499D]"
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </button>
                            )}
                            {nextCol && (
                              <button
                                type="button"
                                onClick={() => onMoveTask(task.id, nextCol)}
                                aria-label={`Chuyển ${task.title} sang cột tiếp theo`}
                                className="flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-gray-200 text-gray-500 transition-colors hover:border-[#14499D] hover:text-[#14499D]"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          <BaseAvatar type={task.assignee.avatar} size={24} />
                        </div>
                      </div>
                    </article>
                  );
                })}

                {/* Column Bottom Add Card Button */}
                <button
                  type="button"
                  onClick={() => handleOpenInlineAdd(col.id)}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[5px] border border-dashed border-gray-300 px-2.5 py-2 text-[12px] font-medium text-gray-500 transition-colors hover:border-[#14499D] hover:bg-white/80 hover:text-[#14499D]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm thẻ công việc</span>
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom Compact Strip: Đề xuất quan trọng cần duyệt (Base Request) */}
      <div className="flex shrink-0 items-center justify-between gap-4 rounded-[6px] border border-[#E5E7EB] bg-white px-3.5 py-2">
        <div className="flex shrink-0 items-center gap-2">
          <RequestBadgeIcon size={20} />
          <span className="text-[11.5px] font-bold text-[#172B4D] uppercase">
            ĐỀ XUẤT QUAN TRỌNG CẦN DUYỆT ({pendingRequests.length})
          </span>
        </div>

        <div className="custom-scrollbar flex flex-1 items-center gap-2 overflow-x-auto py-0.5">
          {requests.slice(0, 4).map((req) => (
            <div
              key={req.id}
              className="flex shrink-0 items-center gap-1.5 rounded border border-gray-200 bg-[#F8FAFC] px-2.5 py-1"
            >
              <button
                type="button"
                onClick={() => onToggleRequest(req.id)}
                aria-label={`Duyệt đề xuất ${req.prefixTag} ${req.title}`}
                className={`flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-[2px] border ${
                  req.completed
                    ? "border-[#22C55E] bg-[#22C55E] text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {req.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </button>
              <button
                type="button"
                onClick={() => onSelectRequest(req)}
                className="max-w-[190px] cursor-pointer truncate text-[11.5px] font-semibold text-gray-800 hover:text-[#14499D]"
              >
                {req.prefixTag} <span className="text-red-600">!</span> {req.title}
              </button>
              <BaseAvatar type={req.requesterAvatar} size={18} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
