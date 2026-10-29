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

export function EmployeeDetail({ employee }: EmployeeDetailProps) {
  const totalHours = calculateWeeklyHours(employee.weeklyHours);
  const workDays = getWorkDays(employee.weeklyHours);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
          {getInitials(employee.name)}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-500">{employee.id}</p>
          <h2 className="font-bold">{employee.name}</h2>
          <p className="text-sm text-slate-500">{employee.position}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500">Email</p>
          <p className="mt-1 break-all text-sm">{employee.email}</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500">Phòng ban</p>
          <p className="mt-1 text-sm">{employee.departmentName}</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500">Tổng giờ làm</p>
          <p className="mt-1 text-lg font-bold">
            {formatHours(totalHours)}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500">Số ngày làm</p>
          <p className="mt-1 text-lg font-bold">{workDays}</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500">Mã ca</p>
          <p className="mt-1 text-sm font-semibold">
            {employee.shiftCode ?? "Chưa phân công"}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500">Trạng thái</p>
          <p className="mt-1 text-sm font-semibold">
            {employee.status === "ACTIVE"
              ? "Đang làm việc"
              : "Ngừng hoạt động"}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold">
          Giờ làm việc trong tuần
        </h3>

        <div className="grid grid-cols-7 gap-2">
          {employee.weeklyHours.map((hours, index) => (
            <div
              key={index}
              className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800"
            >
              <p className="text-xs text-slate-500">
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index]}
              </p>
              <p className="mt-1 text-xs font-semibold">
                {formatHours(hours)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}