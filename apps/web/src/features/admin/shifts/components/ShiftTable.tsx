"use client";

import {
  Edit3,
  Trash2,
  Clock3,
  CalendarDays,
  Coffee,
  ArrowRight,
  CalendarClock,
  ClipboardList,
} from "lucide-react";

import type { Shift } from "../types/shifts.types";

import {
  calculateShiftHours,
  formatHours,
  WEEK_DAYS,
} from "../utils/shift.utils";

type ShiftTableProps = {
  shifts: Shift[];
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (shift: Shift) => void;
  onDelete: (shift: Shift) => void;
};

export function ShiftTable({
  shifts,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: ShiftTableProps) {
  const dayLabels = Object.fromEntries(
    WEEK_DAYS.map((day) => [day.value, day.label]),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Table header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <CalendarClock size={20} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Danh sách ca làm việc
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Quản lý thời gian và lịch làm việc
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
          <ClipboardList
            size={15}
            className="text-slate-500 dark:text-slate-400"
          />

          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Tổng số:
          </span>

          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {shifts.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[850px] border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3.5 font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300 sm:px-5">
                Ca làm việc
              </th>

              <th className="border-b border-slate-200 px-4 py-3.5 font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Thời gian
              </th>

              <th className="border-b border-slate-200 px-4 py-3.5 font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Giờ làm thực
              </th>

              <th className="border-b border-slate-200 px-4 py-3.5 font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Ngày làm
              </th>

              <th className="border-b border-slate-200 px-4 py-3.5 font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Trạng thái
              </th>

              {(canUpdate || canDelete) && (
                <th className="border-b border-slate-200 px-4 py-3.5 text-right font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {shifts.map((shift) => {
              const isActive = shift.status === "ACTIVE";

              const workingHours = calculateShiftHours(shift);

              return (
                <tr
                  key={shift.id}
                  className="group transition-colors duration-200 hover:bg-blue-50/40 dark:hover:bg-slate-800/60"
                >
                  {/* Shift information */}
                  <td className="border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:group-hover:bg-blue-950"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                        }`}
                      >
                        <Clock3 size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {shift.name}
                        </p>

                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono">
                            {shift.code}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Working time */}
                  <td className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {shift.startTime}
                      </span>

                      <ArrowRight
                        size={13}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                        {shift.endTime}
                      </span>
                    </div>

                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Coffee size={13} />

                      Nghỉ {shift.breakMinutes} phút
                    </p>
                  </td>

                  {/* Actual working hours */}
                  <td className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 dark:border-blue-900/50 dark:bg-blue-950/30">
                      <Clock3
                        size={15}
                        className="shrink-0 text-blue-600 dark:text-blue-400"
                      />

                      <span className="whitespace-nowrap text-sm font-bold text-blue-700 dark:text-blue-300">
                        {formatHours(workingHours)}
                      </span>
                    </div>
                  </td>

                  {/* Working days */}
                  <td className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                    <div className="flex max-w-48 flex-wrap gap-1.5">
                      {shift.workDays.length > 0 ? (
                        shift.workDays.map((day) => (
                          <span
                            key={day}
                            className="inline-flex min-w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            title={dayLabels[day] ?? day}
                          >
                            {dayLabels[day] ?? day}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-400">
                          Chưa thiết lập
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                    <span
                      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-semibold ${
                        isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />

                      {isActive ? "Hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </td>

                  {/* Actions */}
                  {(canUpdate || canDelete) && (
                    <td className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                      <div className="flex items-center justify-end gap-1.5">
                        {canUpdate && (
                          <button
                            type="button"
                            title="Sửa ca"
                            aria-label={`Sửa ca ${shift.name}`}
                            onClick={() => onEdit(shift)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-500 outline-none transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:border-blue-900 dark:hover:bg-blue-950/50 dark:hover:text-blue-400"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            title="Xóa ca"
                            aria-label={`Xóa ca ${shift.name}`}
                            onClick={() => onDelete(shift)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-500 outline-none transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-400 dark:hover:border-red-900 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Empty state */}
            {shifts.length === 0 && (
              <tr>
                <td
                  colSpan={canUpdate || canDelete ? 6 : 5}
                  className="px-4 py-16 text-center"
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <CalendarDays size={28} />
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                      Chưa có ca làm việc
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Danh sách hiện chưa có ca làm việc phù hợp để hiển thị.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {shifts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40 sm:px-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Đang hiển thị{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {shifts.length}
            </span>{" "}
            ca làm việc
          </p>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {shifts.filter((shift) => shift.status === "ACTIVE").length} hoạt động
            </span>

            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              {shifts.filter((shift) => shift.status !== "ACTIVE").length} ngừng
            </span>
          </div>
        </div>
      )}
    </div>
  );
}