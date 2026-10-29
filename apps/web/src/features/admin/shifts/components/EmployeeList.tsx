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
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b p-3 dark:border-slate-800">
        <h2 className="text-sm font-bold">Danh sách nhân viên</h2>
        <p className="mt-1 text-xs text-slate-500">
          {employees.length} nhân viên
        </p>

        <input
          aria-label="Tìm nhân viên"
          className="mt-3 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
          placeholder="Tên, mã hoặc email..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {employees.length === 0 ? (
          <p className="p-4 text-center text-sm text-slate-500">
            Không có nhân viên trong phạm vi được phép xem.
          </p>
        ) : (
          employees.map((employee) => {
            const selected = selectedId === employee.id;
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
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left ${
                  selected
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  {getInitials(employee.name)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {employee.name}
                  </span>
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {employee.id} · {employee.departmentName}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {formatHours(totalHours)} / tuần
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}