"use client";

import { useState, type FormEvent } from "react";
import { ShiftForm } from "./ShiftForm";
import { ShiftTable } from "./ShiftTable";
import { useShifts } from "../hooks/useShifts";
import { shiftsApi } from "../api/shifts.api";
import type {
  Shift,
  ShiftInput,
  ShiftScheduleResponse,
} from "../types/shifts.types";

type Tab = "shifts" | "schedule" | "assignment";

function dateString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function initialRange() {
  const from = new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + 6);
  return { from: dateString(from), to: dateString(to), employeeId: "" };
}

export function ShiftsScreen() {
  const {
    shifts,
    total,
    page,
    totalPages,
    query,
    status,
    loading,
    saving,
    error,
    reload,
    setPage,
    setQuery,
    setStatus,
    createShift,
    updateShift,
    deleteShift,
  } = useShifts();
  const [tab, setTab] = useState<Tab>("shifts");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [range, setRange] = useState(initialRange);
  const [schedule, setSchedule] = useState<ShiftScheduleResponse | null>(null);
  const [assignment, setAssignment] = useState({
    shiftId: "",
    employeeId: "",
    workDate: dateString(new Date()),
  });

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
    setActionError("");
    setNotice("");
  }

  function openEdit(shift: Shift) {
    setEditing(shift);
    setFormOpen(true);
    setActionError("");
    setNotice("");
  }

  async function saveShift(input: ShiftInput) {
    if (editing) await updateShift(editing.id, input);
    else await createShift(input);
    setNotice(editing ? "Đã cập nhật ca." : "Đã tạo ca.");
  }

  async function removeShift(shift: Shift) {
    if (!window.confirm(`Xóa hoặc vô hiệu hóa ca “${shift.name}”?`)) return;
    setActionError("");
    setNotice("");
    try {
      const result = await deleteShift(shift.id);
      setNotice(
        result.deleted
          ? "Đã xóa ca chưa có phân công."
          : "Ca đã có lịch phân công nên được vô hiệu hóa; lịch sử vẫn được giữ.",
      );
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Không xóa được ca.");
    }
  }

  async function loadSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    setNotice("");
    setSchedule(null);
    try {
      const result = await shiftsApi.schedule({
        from: range.from,
        to: range.to,
        ...(range.employeeId.trim()
          ? { employeeId: range.employeeId.trim() }
          : {}),
      });
      setSchedule(result);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Không tải được lịch.");
    }
  }

  async function assignShift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    setNotice("");
    try {
      const result = await shiftsApi.assign({
        ...assignment,
        employeeId: assignment.employeeId.trim(),
      });
      setNotice(
        `Đã phân ca ${result.shift.name} cho nhân viên ${result.employeeId} ngày ${result.workDate}.`,
      );
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Không phân được ca.");
    }
  }

  function quickRange(kind: "day" | "week" | "month") {
    const from = new Date();
    const to = new Date(from);
    if (kind === "week") to.setDate(to.getDate() + 6);
    if (kind === "month") to.setDate(to.getDate() + 29);
    setRange((current) => ({ ...current, from: dateString(from), to: dateString(to) }));
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Nhân sự / Lịch làm việc</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Quản lý ca làm việc</h1>
          <p className="mt-1 text-sm text-slate-500">Danh sách ca, lịch phân công và trạng thái hoạt động.</p>
        </div>
        {tab === "shifts" && <button type="button" onClick={openCreate} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Tạo ca mới</button>}
      </header>

      <nav className="flex gap-2 border-b border-slate-200 dark:border-slate-800" aria-label="Chức năng ca làm việc">
        {([["shifts", "Danh sách ca"], ["schedule", "Lịch làm việc"], ["assignment", "Phân ca"]] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => { setTab(key); setActionError(""); setNotice(""); }} className={`border-b-2 px-3 py-2 text-sm ${tab === key ? "border-blue-600 font-semibold text-blue-700" : "border-transparent text-slate-500"}`}>{label}</button>
        ))}
      </nav>

      {(error || actionError) && <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><span>{actionError || error}</span><button type="button" onClick={() => { setActionError(""); void reload(); }} className="font-semibold underline">Thử lại</button></div>}
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      {tab === "shifts" && <section className="min-h-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <label className="grid gap-1 text-sm text-slate-600 dark:text-slate-300">Tìm tên ca<input value={query} maxLength={120} onChange={(event) => { setPage(1); setQuery(event.target.value); }} placeholder="Nhập tên ca" className="min-w-56 rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" /></label>
          <label className="grid gap-1 text-sm text-slate-600 dark:text-slate-300">Trạng thái<select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value as typeof status); }} className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"><option value="all">Tất cả</option><option value="active">Đang hoạt động</option><option value="inactive">Đã vô hiệu hóa</option></select></label>
          <span className="ml-auto text-sm text-slate-500">{total} ca</span>
        </div>
        <ShiftTable shifts={shifts} loading={loading} saving={saving} onEdit={openEdit} onDelete={(shift) => void removeShift(shift)} />
        <div className="flex items-center justify-end gap-3 p-4 text-sm"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-50">Trước</button><span>Trang {page} / {totalPages}</span><button type="button" disabled={page >= totalPages || loading} onClick={() => setPage(page + 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-50">Sau</button></div>
      </section>}

      {tab === "schedule" && <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={loadSchedule} className="flex flex-wrap items-end gap-3">
          <div className="flex gap-2"><button type="button" onClick={() => quickRange("day")} className="rounded-md border px-3 py-2 text-sm">Ngày</button><button type="button" onClick={() => quickRange("week")} className="rounded-md border px-3 py-2 text-sm">Tuần</button><button type="button" onClick={() => quickRange("month")} className="rounded-md border px-3 py-2 text-sm">Tháng</button></div>
          <label className="grid gap-1 text-sm">Từ ngày<input type="date" required value={range.from} onChange={(event) => setRange({ ...range, from: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" /></label>
          <label className="grid gap-1 text-sm">Đến ngày<input type="date" required value={range.to} onChange={(event) => setRange({ ...range, to: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" /></label>
          <label className="grid gap-1 text-sm">ID nhân viên (tùy chọn)<input value={range.employeeId} onChange={(event) => setRange({ ...range, employeeId: event.target.value })} placeholder="Lọc theo ID" className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" /></label>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Tải lịch</button>
        </form>
        {schedule && <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="p-3">Ngày</th><th className="p-3">Nhân viên</th><th className="p-3">Ca</th><th className="p-3">Thời gian</th></tr></thead><tbody>{schedule.items.map((item) => <tr key={item.assignmentId} className="border-b border-slate-100 dark:border-slate-800"><td className="p-3">{item.workDate}</td><td className="p-3">{item.employee.name} <span className="text-slate-500">({item.employee.id})</span></td><td className="p-3">{item.shift.name}</td><td className="p-3">{item.shift.startTime} – {item.shift.endTime}</td></tr>)}{!schedule.items.length && <tr><td colSpan={4} className="p-8 text-center text-slate-500">Không có phân công trong khoảng này.</td></tr>}</tbody></table><p className="mt-3 text-sm text-slate-500">Tổng {schedule.total} phân công</p></div>}
      </section>}

      {tab === "assignment" && <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><form onSubmit={assignShift} className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><h2 className="text-lg font-semibold">Phân ca cho nhân viên</h2><p className="mt-1 text-sm text-slate-500">Backend chưa có endpoint tra cứu nhân viên; nhập ID nhân viên đã biết. Server sẽ xác minh tài khoản, quyền quản lý và xung đột lịch.</p></div>
        <label className="grid gap-1 text-sm">Ca làm việc<select required value={assignment.shiftId} onChange={(event) => setAssignment({ ...assignment, shiftId: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"><option value="">Chọn ca</option>{shifts.filter((shift) => shift.isActive).map((shift) => <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime}–{shift.endTime})</option>)}</select></label>
        <label className="grid gap-1 text-sm">ID nhân viên<input required value={assignment.employeeId} onChange={(event) => setAssignment({ ...assignment, employeeId: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" /></label>
        <label className="grid gap-1 text-sm">Ngày làm việc<input required type="date" value={assignment.workDate} onChange={(event) => setAssignment({ ...assignment, workDate: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" /></label>
        <div className="sm:col-span-2"><button type="submit" disabled={!shifts.some((shift) => shift.id === assignment.shiftId && shift.isActive)} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Phân ca</button></div>
      </form></section>}

      <ShiftForm key={`${formOpen ? "open" : "closed"}:${editing?.id ?? "new"}`} open={formOpen} initialData={editing} saving={saving} onClose={() => setFormOpen(false)} onSubmit={saveShift} />
    </div>
  );
}
