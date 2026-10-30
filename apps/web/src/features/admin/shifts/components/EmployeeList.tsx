"use client";

import type { Employee } from "../types/shifts.types";
import { formatHours, getInitials } from "../utils/shift.utils";

type EmployeeListProps = {
  employees: Employee[];
  selectedId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (employee: Employee) => void;
};

export function EmployeeList({
  employees,
  selectedId,
  search,
  onSearchChange,
  onSelect,
}: EmployeeListProps) {
  const activeCount = employees.filter(
    (employee) => employee.status === "ACTIVE",
  ).length;

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Danh sách nhân viên
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Quản lý và xem lịch làm việc
            </p>
          </div>

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
              <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tổng nhân viên
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {employees.length}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Đang hoạt động
            </p>

            <p className="mt-1 flex items-center gap-2 text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {activeCount}
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            aria-label="Tìm nhân viên"
            type="search"
            autoComplete="off"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-10 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-blue-500 dark:focus:bg-slate-950"
            placeholder="Tên, mã hoặc email..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Xóa nội dung tìm kiếm"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m18 6-12 12M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Employee list */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]">
        {employees.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-4 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4M8 11h6" />
              </svg>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {search.trim()
                ? "Không tìm thấy nhân viên"
                : "Chưa có nhân viên"}
            </p>

            <p className="mt-1 max-w-56 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {search.trim()
                ? "Thử tìm bằng tên, mã nhân viên hoặc email khác."
                : "Danh sách hiện chưa có nhân viên trong phạm vi được phép xem."}
            </p>

            {search.trim() && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {employees.map((employee) => {
              const selected = selectedId === employee.id;
              const isActive = employee.status === "ACTIVE";

              const totalHours = employee.weeklyHours.reduce(
                (sum, hours) => sum + hours,
                0,
              );

              return (
                <button
                  key={employee.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(employee)}
                  className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-3 text-left outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                    selected
                      ? "border-blue-200 bg-blue-50/80 shadow-sm dark:border-blue-800 dark:bg-blue-950/40"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/80"
                  }`}
                >
                  {/* Selected indicator */}
                  {selected && (
                    <span
                      className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-blue-600"
                      aria-hidden="true"
                    />
                  )}

                  {/* Avatar */}
                  <span
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1 transition-all duration-200 ${
                      selected
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-blue-200 dark:ring-blue-800"
                        : "bg-slate-100 text-slate-600 ring-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:ring-blue-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-300"
                    }`}
                  >
                    {getInitials(employee.name)}

                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                        isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                      title={isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                    />
                  </span>

                  {/* Employee information */}
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm font-semibold ${
                        selected
                          ? "text-blue-800 dark:text-blue-300"
                          : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {employee.name}
                    </span>

                    <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">
                      {employee.departmentName || "Chưa phân phòng ban"}
                    </span>

                    <span className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-3 w-3"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                        {formatHours(totalHours)}/tuần
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {isActive ? "Hoạt động" : "Đã nghỉ"}
                      </span>
                    </span>
                  </span>

                  {/* Selection indicator */}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                      selected
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 group-hover:bg-slate-200 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-300"
                    }`}
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                    >
                      {selected ? (
                        <path d="m5 12 4 4L19 6" />
                      ) : (
                        <path d="m9 18 6-6-6-6" />
                      )}
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/50">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Hiển thị{" "}
          <strong className="font-semibold text-slate-700 dark:text-slate-200">
            {employees.length}
          </strong>{" "}
          nhân viên
        </span>

        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {activeCount} đang hoạt động
        </span>
      </div>
    </section>
  );
}
