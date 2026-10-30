"use client";

import type { Employee } from "../types/shifts.types";
import {
  calculateWeeklyHours,
  formatHours,
  getInitials,
  getWorkDays,
} from "../utils/shift.utils";

type EmployeeDetailProps = {
  employee: Employee;
};

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function EmployeeDetail({ employee }: EmployeeDetailProps) {
  const totalHours = calculateWeeklyHours(employee.weeklyHours);
  const workDays = getWorkDays(employee.weeklyHours);
  const isActive = employee.status === "ACTIVE";

  return (
    <section className="space-y-6">
      {/* Employee profile */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-lg shadow-blue-600/20 ring-4 ring-blue-50 dark:ring-blue-950/50">
              {getInitials(employee.name)}
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Hồ sơ nhân viên
              </p>

              <h2 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                {employee.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {employee.position}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Mã nhân viên: {employee.id}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {isActive ? "Đang làm việc" : "Ngừng hoạt động"}
          </div>
        </div>
      </div>

      {/* Weekly overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Tổng giờ làm
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-105 dark:bg-blue-950/50 dark:text-blue-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatHours(totalHours)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Tổng thời gian trong tuần
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Ngày làm việc
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform group-hover:scale-105 dark:bg-violet-950/50 dark:text-violet-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
                <path d="m9 15 2 2 4-4" />
              </svg>
            </span>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {workDays}
            <span className="ml-1 text-base font-medium text-slate-400">
              ngày
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Số ngày có giờ làm
          </p>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Ca làm việc
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-105 dark:bg-amber-950/50 dark:text-amber-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
                <path d="M8 2h8" />
              </svg>
            </span>
          </div>

          <p className="mt-4 truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {employee.shiftCode ?? "Chưa phân công"}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Mã ca hiện tại
          </p>
        </div>
      </div>

      {/* Employee information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Thông tin nhân sự
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Thông tin liên hệ và đơn vị công tác
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Email
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-800 dark:text-slate-200">
              {employee.email || "Chưa cập nhật"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Phòng ban
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
              {employee.departmentName || "Chưa phân phòng ban"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Chức vụ
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
              {employee.position || "Chưa cập nhật"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Trạng thái tài khoản
            </p>
            <p
              className={`mt-2 text-sm font-semibold ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500"
              }`}
            >
              {isActive ? "Đang hoạt động" : "Đã ngừng hoạt động"}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly schedule */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Lịch làm việc trong tuần
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Phân bổ thời gian làm việc từ thứ Hai đến Chủ nhật
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {formatHours(totalHours)} / tuần
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {employee.weeklyHours.map((hours, index) => {
            const hasWork = hours > 0;
            const maxHours = Math.max(8, ...employee.weeklyHours);
            const percentage = Math.min((hours / maxHours) * 100, 100);

            return (
              <div
                key={DAYS[index] ?? index}
                className={`min-w-0 rounded-xl border p-2 text-center transition-all duration-200 sm:p-3 ${
                  hasWork
                    ? "border-blue-100 bg-blue-50/70 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/30 dark:hover:bg-blue-950/50"
                    : "border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40"
                }`}
              >
                <p
                  className={`text-xs font-semibold ${
                    hasWork
                      ? "text-blue-700 dark:text-blue-400"
                      : "text-slate-400"
                  }`}
                >
                  {DAYS[index] ?? `N${index + 1}`}
                </p>

                <p
                  className={`mt-3 text-sm font-bold sm:text-base ${
                    hasWork
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400"
                  }`}
                >
                  {formatHours(hours)}
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      hasWork ? "bg-blue-500" : "bg-transparent"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="mt-2 text-[10px] text-slate-500 sm:text-xs">
                  {hasWork ? "Có lịch" : "Nghỉ"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
            Ngày có lịch làm việc
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-300 dark:bg-slate-600" />
            Ngày nghỉ
          </span>
        </div>
      </div>
    </section>
  );
}