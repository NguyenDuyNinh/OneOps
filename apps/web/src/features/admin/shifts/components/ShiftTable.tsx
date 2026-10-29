"use client";

import { Edit3, Trash2 } from "lucide-react";
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
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="p-3">Ca làm việc</th>
            <th className="p-3">Thời gian</th>
            <th className="p-3">Giờ làm thực</th>
            <th className="p-3">Ngày làm</th>
            <th className="p-3">Trạng thái</th>
            {(canUpdate || canDelete) && (
              <th className="p-3 text-right">Thao tác</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td className="p-3">
                <p className="font-semibold">{shift.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Mã: {shift.code}
                </p>
              </td>

              <td className="whitespace-nowrap p-3">
                {shift.startTime} – {shift.endTime}
                <p className="mt-1 text-xs text-slate-500">
                  Nghỉ {shift.breakMinutes} phút
                </p>
              </td>

              <td className="p-3 font-semibold">
                {formatHours(calculateShiftHours(shift))}
              </td>

              <td className="p-3">
                <div className="flex flex-wrap gap-1">
                  {shift.workDays.map((day) => (
                    <span
                      key={day}
                      className="rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800"
                    >
                      {dayLabels[day] ?? day}
                    </span>
                  ))}
                </div>
              </td>

              <td className="p-3">
                {shift.status === "ACTIVE"
                  ? "Hoạt động"
                  : "Ngừng hoạt động"}
              </td>

              {(canUpdate || canDelete) && (
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    {canUpdate && (
                      <button
                        type="button"
                        title="Sửa ca"
                        aria-label={`Sửa ca ${shift.name}`}
                        onClick={() => onEdit(shift)}
                        className="rounded-lg p-2 hover:bg-blue-50 dark:hover:bg-blue-950"
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
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}

          {shifts.length === 0 && (
            <tr>
              <td
                colSpan={canUpdate || canDelete ? 6 : 5}
                className="p-8 text-center text-slate-500"
              >
                Không có ca làm việc để hiển thị.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}