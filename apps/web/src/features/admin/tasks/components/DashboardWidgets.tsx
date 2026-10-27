"use client";

import React from "react";
import type {
  ComputedDepartmentRow,
  RequestItem,
  TaskItem,
} from "../types";
import { BaseAvatar } from "../ui/Avatar";
import { RequestBadgeIcon, WeworkBadgeIcon } from "../ui/Badges";
import {
  Check,
  ChevronRight,
  ListFilter,
  Maximize2,
  RotateCw,
} from "../ui/icons";

interface WidgetHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  filterCount?: number;
  isEditMode?: boolean;
  onRefresh: () => void;
  onExpand: () => void;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  icon,
  title,
  subtitle,
  filterCount,
  isEditMode,
  onRefresh,
  onExpand,
}) => (
  <div
    className={`flex shrink-0 items-start justify-between gap-2 border-b border-gray-100 px-3.5 pt-3 pb-2 ${
      isEditMode ? "cursor-move bg-blue-50/30" : ""
    }`}
  >
    <div className="flex min-w-0 items-start gap-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <h2 className="truncate text-[12px] leading-snug font-bold tracking-tight text-[#172B4D] uppercase">
          {title}
        </h2>
        <p className="mt-0.5 truncate text-[11px] leading-tight text-[#6B7280]">
          {subtitle}
        </p>
      </div>
    </div>

    <div className="flex shrink-0 items-center gap-1.5">
      {typeof filterCount === "number" && (
        <button
          type="button"
          onClick={onRefresh}
          className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[11px] whitespace-nowrap text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <ListFilter className="h-3 w-3 text-gray-500" />
          <span>{filterCount} bộ lọc</span>
        </button>
      )}
      <button
        type="button"
        onClick={onRefresh}
        aria-label={`Làm mới ${title}`}
        className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
      >
        <RotateCw className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={onExpand}
        aria-label={`Mở rộng ${title}`}
        className="flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
      >
        <Maximize2 className="h-3 w-3" />
      </button>
    </div>
  </div>
);

interface TaskListWidgetProps {
  title: string;
  subtitle: string;
  filterCount?: number;
  tasks: TaskItem[];
  showUrgentTags?: boolean;
  isEditMode?: boolean;
  onToggleTask: (taskId: string) => void;
  onSelectTask: (task: TaskItem) => void;
  onRefresh: () => void;
  onExpand: () => void;
}

export const TaskListWidget: React.FC<TaskListWidgetProps> = ({
  title,
  subtitle,
  filterCount = 1,
  tasks,
  showUrgentTags = false,
  isEditMode = false,
  onToggleTask,
  onSelectTask,
  onRefresh,
  onExpand,
}) => {
  return (
    <section
      aria-label={title}
      className={`flex h-[325px] flex-col overflow-hidden rounded-[6px] border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
        isEditMode ? "border-dashed border-blue-400" : "border-[#E5E7EB]"
      }`}
    >
      <WidgetHeader
        icon={<WeworkBadgeIcon size={22} />}
        title={title}
        subtitle={subtitle}
        filterCount={filterCount}
        isEditMode={isEditMode}
        onRefresh={onRefresh}
        onExpand={onExpand}
      />

      <div className="custom-scrollbar flex-1 divide-y divide-gray-100 overflow-y-auto px-3.5">
        {tasks.map((task) => {
          const isCompleted = task.status === "completed";
          const isInProgress = task.status === "in_progress";

          return (
            <div
              key={task.id}
              className={`${
                showUrgentTags ? "py-[11px]" : "py-[7.5px]"
              } group flex items-center justify-between gap-2.5 transition-colors hover:bg-slate-50/70`}
            >
              {/* Left Circular Status Checkbox */}
              <button
                type="button"
                onClick={() => onToggleTask(task.id)}
                aria-label={`Đánh dấu hoàn thành ${task.title}`}
                className={`flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
                  isCompleted
                    ? "border-[#64C16E] bg-[#64C16E] text-white"
                    : "border-gray-300 bg-white hover:border-[#64C16E]"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3 stroke-[3]" />
                ) : isInProgress ? (
                  <span className="inline-block h-2 w-2 rounded-full bg-[#3AA665]" />
                ) : null}
              </button>

              {/* Middle Title & Tags/Meta */}
              <button
                type="button"
                onClick={() => onSelectTask(task)}
                className="min-w-0 flex-1 cursor-pointer text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-[12.5px] font-medium ${
                      isCompleted
                        ? "text-gray-700"
                        : "text-[#172B4D] group-hover:text-[#14499D]"
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span className="shrink-0 text-[11.5px] font-normal text-[#374151] tabular-nums">
                      {task.dueDate}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                  {showUrgentTags && task.urgent && (
                    <span className="shrink-0 rounded-full bg-[#DF6A6A] px-2 py-[1px] text-[10px] leading-tight font-medium text-white">
                      Khẩn cấp
                    </span>
                  )}
                  {showUrgentTags && task.important && (
                    <span className="shrink-0 rounded-full bg-[#57BB63] px-2 py-[1px] text-[10px] leading-tight font-medium text-white">
                      Quan trọng
                    </span>
                  )}
                  <span className="truncate text-[11px] text-[#6B7280]">
                    {task.metaText}
                  </span>
                </div>
              </button>

              {/* Right Avatar */}
              <div className="shrink-0">
                <BaseAvatar type={task.assignee.avatar} size={26} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

interface RequestListWidgetProps {
  requests: RequestItem[];
  isEditMode?: boolean;
  onToggleRequest: (reqId: string) => void;
  onSelectRequest: (req: RequestItem) => void;
  onRefresh: () => void;
  onExpand: () => void;
}

export const RequestListWidget: React.FC<RequestListWidgetProps> = ({
  requests,
  isEditMode = false,
  onToggleRequest,
  onSelectRequest,
  onRefresh,
  onExpand,
}) => {
  return (
    <section
      aria-label="ĐỀ XUẤT QUAN TRỌNG CẦN DUYỆT | ALL"
      className={`flex h-[325px] flex-col overflow-hidden rounded-[6px] border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
        isEditMode ? "border-dashed border-blue-400" : "border-[#E5E7EB]"
      }`}
    >
      <WidgetHeader
        icon={<RequestBadgeIcon size={22} />}
        title="ĐỀ XUẤT QUAN TRỌNG CẦN DUYỆT | ALL"
        subtitle="Nhóm: Đề xuất duyệt báo giá, Đề xuất chương trình ..."
        isEditMode={isEditMode}
        onRefresh={onRefresh}
        onExpand={onExpand}
      />

      <div className="custom-scrollbar flex-1 divide-y divide-gray-100 overflow-y-auto px-3.5">
        {requests.map((req) => (
          <div
            key={req.id}
            className="group flex items-center justify-between gap-2 py-[8.5px] transition-colors hover:bg-slate-50/70"
          >
            {/* Square Checkbox */}
            <button
              type="button"
              onClick={() => onToggleRequest(req.id)}
              aria-label={`Duyệt đề xuất ${req.prefixTag} ${req.title}`}
              className={`flex h-[16px] w-[16px] shrink-0 cursor-pointer items-center justify-center rounded-[3px] border transition-colors ${
                req.completed
                  ? "border-[#3AA665] bg-[#3AA665] text-white"
                  : "border-gray-300 bg-white hover:border-[#3AA665]"
              }`}
            >
              {req.completed && <Check className="h-3 w-3 stroke-[3]" />}
            </button>

            {/* Title with red exclamation & Subtitle */}
            <button
              type="button"
              onClick={() => onSelectRequest(req)}
              className="min-w-0 flex-1 cursor-pointer text-left"
            >
              <div className="flex items-center gap-1 truncate text-[12.5px] font-bold text-[#111827]">
                <span>{req.prefixTag}</span>
                <span className="font-extrabold text-[#DC2626]">!</span>
                <span className="truncate">{req.title}</span>
              </div>
              <div className="mt-0.5 truncate text-[11px] text-[#6B7280]">
                {req.subtitle}
              </div>
            </button>

            {/* Avatars chain with > arrow & blue status dot */}
            <div className="flex shrink-0 items-center gap-1">
              <BaseAvatar type={req.requesterAvatar} size={23} />
              <ChevronRight className="h-3 w-3 stroke-[2] text-gray-400" />
              <div className="flex items-center -space-x-1">
                {req.approverAvatars.map((av, idx) => (
                  <BaseAvatar
                    key={idx}
                    type={av}
                    size={23}
                    className="ring-1 ring-white"
                  />
                ))}
              </div>
              <span className="ml-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-[#3B73B9]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

interface ReportTableWidgetProps {
  rows: ComputedDepartmentRow[];
  isEditMode?: boolean;
  onRefresh: () => void;
  onExpand: () => void;
}

export const ReportTableWidget: React.FC<ReportTableWidgetProps> = ({
  rows,
  isEditMode = false,
  onRefresh,
  onExpand,
}) => {
  const tableRows = rows.filter((r) => r.showInReportTable);

  return (
    <section
      aria-label="REPORT | DANH SÁCH CÔNG VIỆC REVENUE HCM"
      className={`flex h-[315px] flex-col overflow-hidden rounded-[6px] border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
        isEditMode ? "border-dashed border-blue-400" : "border-[#E5E7EB]"
      }`}
    >
      <WidgetHeader
        icon={<WeworkBadgeIcon size={22} />}
        title="REPORT | DANH SÁCH CÔNG VIỆC REVENUE HCM"
        subtitle="Dự án/ Phòng ban: Tất cả"
        isEditMode={isEditMode}
        onRefresh={onRefresh}
        onExpand={onExpand}
      />

      <div className="flex flex-1 flex-col justify-between overflow-x-auto overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] font-bold whitespace-nowrap text-[#64C16E] uppercase">
              <th className="py-2 pr-2 pl-3.5 font-bold">NHÓM</th>
              <th className="w-[68px] border-l border-gray-100 px-2.5 py-2 font-bold">
                TẤT CẢ
              </th>
              <th className="w-[98px] border-l border-gray-100 px-2.5 py-2 font-bold">
                TRONG THỜI HẠN
              </th>
              <th className="w-[68px] border-l border-gray-100 px-2.5 py-2 font-bold">
                QUÁ HẠN
              </th>
              <th className="w-[78px] border-l border-gray-100 px-2.5 py-2 font-bold">
                HOÀN THÀNH
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-[12px] tabular-nums">
            {tableRows.map((row) => {
              const total = Math.max(1, row.total);
              const inTimePct = Math.round((row.inTime / total) * 100);
              const overduePct = Math.round((row.overdue / total) * 100);
              const completedPct = Math.round((row.completed / total) * 100);
              const otherPct = Math.max(
                0,
                100 - inTimePct - overduePct - completedPct,
              );

              return (
                <tr
                  key={row.id}
                  className="h-[31px] transition-colors hover:bg-slate-50/80"
                >
                  <td className="py-1.5 pr-2.5 pl-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          style={{ backgroundColor: row.badgeColor }}
                          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        >
                          {row.badgeLetter}
                        </span>
                        <span
                          className={`truncate text-[11.5px] ${
                            row.badgeLetter === "D"
                              ? "font-bold text-[#111827] uppercase"
                              : "font-semibold text-[#1F2937]"
                          }`}
                        >
                          {row.name}
                        </span>
                      </div>

                      <div className="flex h-[9px] w-[62px] shrink-0 overflow-hidden bg-[#E5E7EB]">
                        {inTimePct > 0 && (
                          <div
                            style={{ width: `${inTimePct}%` }}
                            className="h-full bg-[#93B8E0] transition-all duration-300"
                          />
                        )}
                        {overduePct > 0 && (
                          <div
                            style={{ width: `${overduePct}%` }}
                            className="h-full bg-[#C86D6D] transition-all duration-300"
                          />
                        )}
                        {completedPct > 0 && (
                          <div
                            style={{ width: `${completedPct}%` }}
                            className="h-full bg-[#88C488] transition-all duration-300"
                          />
                        )}
                        {otherPct > 0 && (
                          <div
                            style={{ width: `${otherPct}%` }}
                            className="h-full bg-[#D5CB7A] transition-all duration-300"
                          />
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="border-l border-gray-100 px-2.5 py-1.5 font-bold text-[#111827]">
                    {row.total}
                  </td>
                  <td className="border-l border-gray-100 px-2.5 py-1.5 font-medium text-[#2563EB]">
                    {row.inTime}
                  </td>
                  <td className="border-l border-gray-100 px-2.5 py-1.5 font-medium text-[#991B1B]">
                    {row.overdue}
                  </td>
                  <td className="border-l border-gray-100 px-2.5 py-1.5 font-medium text-[#16A34A]">
                    {row.completed}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="bg-white px-3.5 py-1.5">
          <div className="h-[6px] w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-[68%] rounded-full bg-[#C8CCD0]" />
          </div>
        </div>
      </div>
    </section>
  );
};

interface WorkloadChartWidgetProps {
  rows: ComputedDepartmentRow[];
  isEditMode?: boolean;
  onRefresh: () => void;
  onExpand: () => void;
}

export const WorkloadChartWidget: React.FC<WorkloadChartWidgetProps> = ({
  rows,
  isEditMode = false,
  onRefresh,
  onExpand,
}) => {
  const chartRows = [...rows]
    .filter((r) => r.showInWorkloadChart)
    .sort((a, b) => a.chartOrder - b.chartOrder);
  const maxAxis = 30;

  return (
    <section
      aria-label="WORKLOAD TỔNG SỐ CÔNG VIỆC HIỆN TẠI"
      className={`flex h-[315px] flex-col overflow-hidden rounded-[6px] border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
        isEditMode ? "border-dashed border-blue-400" : "border-[#E5E7EB]"
      }`}
    >
      <WidgetHeader
        icon={<WeworkBadgeIcon size={22} />}
        title="WORKLOAD TỔNG SỐ CÔNG VIỆC HIỆN TẠI"
        subtitle="Dự án/ Phòng ban: Tất cả"
        filterCount={1}
        isEditMode={isEditMode}
        onRefresh={onRefresh}
        onExpand={onExpand}
      />

      <div className="flex flex-1 flex-col justify-between px-4 pt-3 pb-2">
        <div className="flex flex-1 items-stretch gap-2">
          {/* Rotated Y-axis label */}
          <div className="flex w-4 shrink-0 items-center justify-center">
            <span className="-rotate-90 text-[11px] font-medium whitespace-nowrap text-[#4B5563]">
              Tổng số công việc
            </span>
          </div>

          {/* Y-axis ticks + Plot area */}
          <div className="flex flex-1 flex-col justify-between">
            <div className="relative flex flex-1">
              <div className="flex flex-col justify-between py-0.5 pr-2 text-[10px] text-gray-500 tabular-nums select-none">
                <span>30</span>
                <span>20</span>
                <span>10</span>
                <span>0</span>
              </div>

              <div className="relative flex flex-1 flex-col justify-between border-b border-gray-300">
                <div className="h-0 w-full border-t border-gray-100" />
                <div className="h-0 w-full border-t border-gray-100" />
                <div className="h-0 w-full border-t border-gray-100" />
                <div className="h-0 w-full" />

                <div className="absolute inset-0 grid grid-cols-8 items-end gap-2 px-2">
                  {chartRows.map((col) => {
                    const heightPct = Math.min(
                      100,
                      Math.round((col.workload / maxAxis) * 100),
                    );
                    return (
                      <div
                        key={col.id}
                        className="group relative flex h-full flex-col items-center justify-end"
                      >
                        <div className="pointer-events-none absolute -top-5 z-10 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-white tabular-nums opacity-0 transition-opacity group-hover:opacity-100">
                          {col.workload} CV
                        </div>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-[24px] rounded-t-[1px] bg-[#2D95A0] transition-all duration-300 hover:bg-[#237B85] sm:w-[26px]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-1 pt-2 pl-6 text-center">
              {chartRows.map((col) => (
                <div
                  key={col.id}
                  className="text-[9.5px] leading-[1.2] break-words whitespace-pre-line text-[#374151]"
                >
                  {col.shortChartLabel}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
