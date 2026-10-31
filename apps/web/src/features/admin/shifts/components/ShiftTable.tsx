"use client";

import type { Shift } from "../types/shifts.types";

type ShiftTableProps = {
  shifts: Shift[];
  loading: boolean;
  saving: boolean;
  onEdit: (shift: Shift) => void;
  onDelete: (shift: Shift) => void;
};

export function ShiftTable({
  shifts,
  loading,
  saving,
  onEdit,
  onDelete,
}: ShiftTableProps) {
  if (loading) return <p className="p-8 text-center" role="status">Đang tải danh sách ca…</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <th className="p-3">Tên ca</th><th className="p-3">Khung giờ</th><th className="p-3">Thời gian nghỉ</th><th className="p-3">Trạng thái</th><th className="p-3">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id} className="border-b border-slate-100 dark:border-slate-800">
              <td className="p-3 font-semibold">{shift.name}</td>
              <td className="p-3">{shift.startTime} – {shift.endTime}</td>
              <td className="p-3">{shift.breakMinutes} phút</td>
              <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${shift.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{shift.isActive ? "Hoạt động" : "Vô hiệu hóa"}</span></td>
              <td className="p-3"><div className="flex gap-2"><button type="button" onClick={() => onEdit(shift)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm">Sửa</button><button type="button" disabled={saving} onClick={() => onDelete(shift)} className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50">Xóa</button></div></td>
            </tr>
          ))}
          {!shifts.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Không có ca phù hợp.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
