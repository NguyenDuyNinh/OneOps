"use client";

import React from "react";
import type {
  DashboardViewMode,
  DisplayMode,
  EisenhowerTab,
  PriorityFilter,
} from "../types";
import { WeworkBadgeIcon } from "../ui/Badges";
import { Columns3, LayoutDashboard, MoreHorizontal, Plus } from "../ui/icons";

interface TasksSubHeaderProps {
  displayMode: DisplayMode;
  onChangeDisplayMode: (mode: DisplayMode) => void;
  priorityFilter: PriorityFilter;
  onChangePriorityFilter: (filter: PriorityFilter) => void;
  activeTab: EisenhowerTab;
  onChangeActiveTab: (tab: EisenhowerTab) => void;
  viewMode: DashboardViewMode;
  onChangeViewMode: (mode: DashboardViewMode) => void;
  totalTasksCount: number;
  urgentImportantCount?: number;
  urgentNotImportantCount?: number;
  notUrgentImportantCount?: number;
  onOpenCreateModal: () => void;
}

export const TasksSubHeader: React.FC<TasksSubHeaderProps> = ({
  displayMode,
  onChangeDisplayMode,
  priorityFilter,
  onChangePriorityFilter,
  activeTab,
  onChangeActiveTab,
  viewMode,
  onChangeViewMode,
  totalTasksCount,
  onOpenCreateModal,
}) => {
  return (
    <div className="bg-white border-b border-[#E5E7EB] px-5 pt-3 flex items-end justify-between gap-4 shrink-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-2.5">
          <WeworkBadgeIcon size={22} />
          <h1 className="text-[18px] font-bold text-[#111827] leading-tight">
            {displayMode === "kanban"
              ? "Kanban — Dự án & Công việc trọng điểm"
              : "Dashboard"}
          </h1>
        </div>

        {/* Filter Tabs */}
        {displayMode === "kanban" ? (
          <div className="flex items-center gap-6 text-[13px] overflow-x-auto">
            <button
              type="button"
              onClick={() => onChangePriorityFilter("all")}
              className={`pb-2.5 transition-colors relative cursor-pointer whitespace-nowrap ${
                priorityFilter === "all"
                  ? "text-[#14499D] font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Tất cả công việc ({totalTasksCount})
              {priorityFilter === "all" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#14499D] rounded-t" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onChangePriorityFilter("urgent_important")}
              className={`pb-2.5 transition-colors relative cursor-pointer whitespace-nowrap ${
                priorityFilter === "urgent_important"
                  ? "text-[#14499D] font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Khẩn Cấp & Quan Trọng
              {priorityFilter === "urgent_important" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#14499D] rounded-t" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onChangePriorityFilter("urgent_only")}
              className={`pb-2.5 transition-colors relative cursor-pointer whitespace-nowrap ${
                priorityFilter === "urgent_only"
                  ? "text-[#14499D] font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Khẩn cấp & Không quan trọng
              {priorityFilter === "urgent_only" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#14499D] rounded-t" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onChangePriorityFilter("important_only")}
              className={`pb-2.5 transition-colors relative cursor-pointer whitespace-nowrap ${
                priorityFilter === "important_only"
                  ? "text-[#14499D] font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Không khẩn Cấp & Quan trọng
              {priorityFilter === "important_only" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#14499D] rounded-t" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6 text-[13px] overflow-x-auto">
            <button
              type="button"
              onClick={() => onChangeActiveTab("urgent_important")}
              className={`pb-2.5 transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === "urgent_important"
                  ? "text-[#14499D] font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Khẩn Cấp & Quan Trọng
              {activeTab === "urgent_important" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#14499D] rounded-t" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onChangeActiveTab("urgent_not_important")}
              className={`pb-2.5 transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === "urgent_not_important"
                  ? "text-[#14499D] font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Khẩn cấp & Không quan trọng
              {activeTab === "urgent_not_important" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#14499D] rounded-t" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onChangeActiveTab("not_urgent_important")}
              className={`pb-2.5 transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === "not_urgent_important"
                  ? "text-[#14499D] font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Không khẩn Cấp & Quan trọng
              {activeTab === "not_urgent_important" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#14499D] rounded-t" />
              )}
            </button>

            <button
              type="button"
              aria-label="Tùy chọn tab"
              className="pb-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Right Controls: + Thêm công việc & View Mode Switcher (Kanban / Dashboard) */}
      <div className="flex items-center gap-2.5 pb-3 shrink-0">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="h-[32px] px-3.5 bg-[#14499D] hover:bg-[#103B82] text-white text-[12.5px] font-medium rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>{displayMode === "kanban" ? "Thêm công việc" : "Thêm widget"}</span>
        </button>

        {/* Kanban vs Dashboard Switcher */}
        <div className="flex items-center bg-[#F3F4F6] border border-[#E5E7EB] rounded-[4px] p-[2px]">
          <button
            type="button"
            onClick={() => onChangeDisplayMode("kanban")}
            className={`px-3 py-1 text-[12px] font-medium rounded-[3px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              displayMode === "kanban"
                ? "bg-[#E1ECFA] text-[#14499D] font-semibold"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeDisplayMode("dashboard")}
            className={`px-3 py-1 text-[12px] font-medium rounded-[3px] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              displayMode === "dashboard"
                ? "bg-[#E1ECFA] text-[#14499D] font-semibold"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>

        {displayMode === "dashboard" && (
          <div className="flex items-center bg-[#F3F4F6] border border-[#E5E7EB] rounded-[4px] p-[2px]">
            <button
              type="button"
              onClick={() => onChangeViewMode("view")}
              className={`px-2.5 py-1 text-[12px] font-medium rounded-[3px] transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === "view"
                  ? "bg-[#E1ECFA] text-[#14499D] font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Xem
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode("edit")}
              className={`px-2.5 py-1 text-[12px] font-medium rounded-[3px] transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === "edit"
                  ? "bg-[#E1ECFA] text-[#14499D] font-semibold"
                  : "text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              Sửa
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
