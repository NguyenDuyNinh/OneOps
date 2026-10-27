"use client";

import React, { useState } from "react";
import type { TaskItem } from "../types";
import { BaseAvatar } from "../ui/Avatar";
import {
  AlertCircle,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  MoreHorizontal,
  Plus,
  Star,
  X,
} from "../ui/icons";

interface TaskDetailModalProps {
  task: TaskItem | null;
  onClose: () => void;
  onToggleStatus: (taskId: string) => void;
  onTogglePriority?: (taskId: string, field: "urgent" | "important") => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onUpdateDescription: (taskId: string, description: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onToggleStatus,
  onTogglePriority,
  onAddSubtask,
  onUpdateDescription,
}) => {
  const [subtaskInput, setSubtaskInput] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  if (!task) return null;

  const isCompleted = task.status === "completed";

  const handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && subtaskInput.trim()) {
      e.preventDefault();
      onAddSubtask(task.id, subtaskInput);
      setSubtaskInput("");
    }
  };

  const handleStartEditDesc = () => {
    setDescDraft(task.description);
    setIsEditingDesc(true);
  };

  const handleSaveDesc = () => {
    onUpdateDescription(task.id, descDraft);
    setIsEditingDesc(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[930px] bg-white rounded-[4px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Blue Header matching yt_maxres1.jpg */}
        <div className="h-[42px] bg-[#1D509E] text-white px-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-[14px] font-medium hover:opacity-90 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Chi tiết công việc</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chi tiết công việc"
            className="p-1 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-white">
          {/* Left Main Content (~68% -> 8 cols) */}
          <div className="lg:col-span-8 p-5 border-r border-gray-200">
            {/* Top Tag Bar & Quick Action Icons */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => onTogglePriority?.(task.id, "urgent")}
                  title="Bấm để bật/tắt nhãn Khẩn cấp"
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide cursor-pointer transition-colors ${
                    task.urgent
                      ? "bg-[#DF6A6A] text-white"
                      : "border border-dashed border-gray-300 text-gray-400 hover:border-[#DF6A6A] hover:text-[#DF6A6A]"
                  }`}
                >
                  {task.urgent ? "KHẨN CẤP" : "+ KHẨN CẤP"}
                </button>
                <button
                  type="button"
                  onClick={() => onTogglePriority?.(task.id, "important")}
                  title="Bấm để bật/tắt nhãn Quan trọng"
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide cursor-pointer transition-colors ${
                    task.important
                      ? "bg-[#64C16E] text-white"
                      : "border border-dashed border-gray-300 text-gray-400 hover:border-[#64C16E] hover:text-[#64C16E]"
                  }`}
                >
                  {task.important ? "QUAN TRỌNG" : "+ QUAN TRỌNG"}
                </button>
                {task.overdue && !isCompleted && (
                  <span className="bg-[#E89B4C] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    QUÁ HẠN
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-400">
                <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                <AlertCircle className="w-4 h-4 text-[#C94A4A] fill-[#C94A4A]/10" />
                <Bookmark className="w-4 h-4 text-[#57BB63] fill-[#57BB63]" />
                <Calendar className="w-4 h-4 cursor-pointer hover:text-gray-600" />
                <Star className="w-4 h-4 cursor-pointer hover:text-amber-400" />
              </div>
            </div>

            {/* Task Title */}
            <h2
              id="task-modal-title"
              className="text-[18px] font-bold text-[#172B4D] leading-snug mb-2"
            >
              {task.title}
            </h2>

            {/* Project & Stage Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full inline-block ${
                  isCompleted ? "bg-[#57BB63]" : "bg-[#4A76B8]"
                }`}
              />
              <span>{isCompleted ? "Hoàn thành" : "Đang làm"}</span>
              <span>·</span>
              <span>Trong {task.project}</span>
              <span>›</span>
              <span className="text-[#2B6CB0] font-medium inline-flex items-center gap-0.5">
                {task.stage} <ChevronDown className="w-3 h-3" />
              </span>
            </div>

            {/* Start & Due Date Line */}
            <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-4 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Ngày bắt đầu:{" "}
                <strong className="text-[#2B6CB0] font-normal">
                  {task.startDate || "00:00 04/02/2023"}
                </strong>
              </span>
              <span>→</span>
              <span>
                Thời hạn:{" "}
                <strong className="text-[#2B6CB0] font-normal">
                  {task.dueDate || "04/02/2023"}
                </strong>
              </span>
            </div>

            {/* Status & Assignee Split Box matching yt_maxres1.jpg */}
            <div className="flex items-stretch border border-gray-200 rounded-[4px] overflow-hidden mb-5 max-w-[540px]">
              <button
                type="button"
                onClick={() => onToggleStatus(task.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 border-r border-gray-200 transition-colors cursor-pointer min-w-[140px] ${
                  isCompleted
                    ? "bg-[#EBF9EE] text-[#229954]"
                    : "bg-[#EBF3FA] text-[#1D509E]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    isCompleted
                      ? "bg-[#57BB63] border-[#57BB63] text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
                <span className="text-[12.5px] font-semibold">
                  {isCompleted ? "Hoàn thành" : "Đang làm"}
                </span>
              </button>

              <div className="flex-1 flex items-center justify-between px-3.5 py-2 bg-white">
                <div className="flex items-center gap-2.5">
                  <BaseAvatar type={task.assignee.avatar} size={28} />
                  <div>
                    <div className="text-[12.5px] font-semibold text-gray-900 leading-tight">
                      {task.assignee.name}
                    </div>
                    <div className="text-[11px] text-gray-400 leading-tight">
                      {task.assignee.role}
                    </div>
                  </div>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* MÔ TẢ CÔNG VIỆC */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#3AA665] uppercase tracking-wide">
                  MÔ TẢ CÔNG VIỆC
                </span>
                <div className="flex items-center gap-3 text-[11.5px] text-[#3B73B9]">
                  <button
                    type="button"
                    onClick={handleStartEditDesc}
                    className="hover:underline cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={handleStartEditDesc}
                    className="hover:underline cursor-pointer"
                  >
                    Tạo checklist
                  </button>
                </div>
              </div>
              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    placeholder="Nhập mô tả công việc..."
                    className="w-full border border-gray-300 rounded p-2 text-xs text-gray-800 outline-none focus:border-blue-600"
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDesc}
                      className="px-3 py-1 bg-[#1D509E] text-white text-xs rounded cursor-pointer"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDesc(false)}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[12.5px] text-gray-500 min-h-[20px]">
                  {task.description ? task.description : "≡"}
                </div>
              )}
            </div>

            {/* TÀI LIỆU ĐÍNH KÈM */}
            <div className="mb-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#3AA665] uppercase tracking-wide">
                  TÀI LIỆU ĐÍNH KÈM
                </span>
                <div className="flex items-center gap-3 text-[11.5px] text-[#3B73B9]">
                  <button type="button" className="hover:underline cursor-pointer">
                    Thêm tài liệu
                  </button>
                  <button type="button" className="hover:underline cursor-pointer">
                    Thêm tài liệu từ Base Drive
                  </button>
                </div>
              </div>
              <div className="text-[12px] text-gray-400">Không có tài liệu đính kèm</div>
            </div>

            {/* KẾT QUẢ CÔNG VIỆC */}
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-[12.5px] font-bold text-gray-900 uppercase mb-3">
                KẾT QUẢ CÔNG VIỆC
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-[2px] h-5 bg-[#57BB63] inline-block" />
                <span className="text-[13px] text-gray-700 font-medium tabular-nums">
                  [{task.progress}%]
                </span>
              </div>
              <div className="text-[12px] text-gray-400">
                <button
                  type="button"
                  onClick={() => onToggleStatus(task.id)}
                  className="text-[#2B6CB0] hover:underline cursor-pointer"
                >
                  Cập nhật kết quả công việc
                </button>{" "}
                hoặc{" "}
                <span className="text-[#2B6CB0] hover:underline cursor-pointer">
                  Tải lên tài liệu
                </span>{" "}
                ·{" "}
                <span className="text-[#2B6CB0] hover:underline cursor-pointer">
                  Tải lên từ Base Drive
                </span>
              </div>
            </div>

            {/* CÔNG VIỆC CON */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[12.5px] font-bold text-gray-900 uppercase">
                  CÔNG VIỆC CON
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (subtaskInput.trim()) {
                      onAddSubtask(task.id, subtaskInput);
                      setSubtaskInput("");
                    }
                  }}
                  className="text-[11px] font-semibold text-[#2B6CB0] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>TẠO CV CON ĐẦY ĐỦ</span>
                </button>
              </div>

              {task.subtasks.length > 0 && (
                <ul className="space-y-1.5 mb-2.5">
                  {task.subtasks.map((st) => (
                    <li
                      key={st.id}
                      className="flex items-center justify-between text-[12.5px] text-gray-700 bg-gray-50 px-3 py-1.5 rounded border border-gray-200"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-400 inline-block" />
                        <span>{st.title}</span>
                      </span>
                      <span className="text-[11px] text-gray-400">{st.assigneeName}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="relative flex items-center">
                <Plus className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={handleSubtaskKeyDown}
                  placeholder="Tạo công việc con, nhập @ để gắn thẻ và giao việc, nhấn enter để lưu"
                  className="w-full h-[36px] pl-8 pr-3 text-[12px] border border-gray-200 rounded-[3px] text-gray-700 placeholder-gray-400 outline-none focus:border-[#1D509E]"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar (~32% -> 4 cols) matching yt_maxres1.jpg */}
          <div className="lg:col-span-4 bg-[#F3F4F6] p-3.5 space-y-2.5">
            {/* Overdue or Status Alert Box */}
            <div
              className={`rounded-[4px] py-2.5 px-3 text-white flex items-center justify-center gap-2 text-[12.5px] font-medium ${
                isCompleted ? "bg-[#3AA665]" : "bg-[#C94A4A]"
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {isCompleted ? "Công việc đã hoàn thành" : "Công việc đã quá hạn"}
              </span>
            </div>

            {/* Target Link Box */}
            <div className="rounded-[4px] bg-[#FBEAEA] border border-[#F3D1D1] py-2.5 px-3 text-center text-[11.5px] text-[#B94A48]">
              <div className="flex items-center justify-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Chưa liên kết với mục tiêu</span>
              </div>
              <button
                type="button"
                className="mt-0.5 inline-flex items-center gap-1 font-semibold text-[#A93226] hover:underline cursor-pointer"
              >
                <span>Lựa chọn mục tiêu</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* NGƯỜI GIAO VIỆC Card */}
            <div className="bg-white rounded-[4px] border border-gray-200/80 p-3">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-[#3AA665] uppercase mb-2.5">
                <span>NGƯỜI GIAO VIỆC</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div className="flex items-center gap-2.5">
                <BaseAvatar type={task.assigner.avatar} size={30} />
                <div>
                  <div className="text-[12.5px] font-bold text-gray-900">
                    {task.assigner.name}
                  </div>
                  <div className="text-[11px] text-gray-400">{task.assigner.role}</div>
                </div>
              </div>
            </div>

            {/* Timestamps Card */}
            <div className="bg-white rounded-[4px] border border-gray-200/80 p-3 space-y-2 text-[11.5px] text-gray-500 tabular-nums">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  TG tạo: <strong className="text-gray-800">{task.createdAt}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  TG cập nhật: <strong className="text-gray-800">{task.updatedAt}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  Bắt đầu:{" "}
                  <strong className="text-gray-800">
                    {task.startDate || "00:00 04/02/2023"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  Thời hạn:{" "}
                  <strong className="text-gray-800">
                    23:59 {task.dueDate || "04/02/2023"}
                  </strong>
                </span>
              </div>
            </div>

            {/* NGƯỜI THEO DÕI Card */}
            <div className="bg-white rounded-[4px] border border-gray-200/80 p-3">
              <div className="flex items-center justify-between text-[10.5px] font-bold text-[#3AA665] uppercase mb-2.5">
                <span>NGƯỜI THEO DÕI</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
              {task.followers.map((follower, idx) => (
                <div key={idx} className="flex items-center gap-2.5 mb-3">
                  <BaseAvatar type={follower.avatar} size={30} />
                  <div>
                    <div className="text-[12.5px] font-bold text-gray-900">
                      {follower.name}
                    </div>
                    <div className="text-[11px] text-gray-400">{follower.role}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 text-[10px] font-semibold text-gray-500">
                <button type="button" className="hover:text-gray-800 cursor-pointer">
                  + NGƯỜI THEO DÕI
                </button>
                <button type="button" className="hover:text-gray-800 cursor-pointer">
                  + THÊM TỪ NGOÀI
                </button>
              </div>
            </div>

            {/* LỊCH SỬ HOẠT ĐỘNG Card */}
            <div className="bg-white rounded-[4px] border border-gray-200/80 p-3 flex items-center justify-between text-[10.5px] font-bold text-[#3AA665] uppercase">
              <span>LỊCH SỬ HOẠT ĐỘNG</span>
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
