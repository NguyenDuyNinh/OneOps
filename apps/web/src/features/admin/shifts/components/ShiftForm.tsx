"use client";

import { useState, type FormEvent } from "react";
import type { Shift, ShiftInput } from "../types/shifts.types";

type ShiftFormProps = {
  open: boolean;
  initialData: Shift | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: ShiftInput) => Promise<void>;
};

const EMPTY_FORM: ShiftInput = {
  name: "",
  startTime: "08:00",
  endTime: "17:00",
  breakMinutes: 60,
  isActive: true,
};

function toFormData(shift: Shift | null): ShiftInput {
  if (!shift) return EMPTY_FORM;
  return {
    name: shift.name,
    startTime: shift.startTime,
    endTime: shift.endTime,
    breakMinutes: shift.breakMinutes,
    isActive: shift.isActive,
  };
}

export function ShiftForm({
  open,
  initialData,
  saving = false,
  onClose,
  onSubmit,
}: ShiftFormProps) {
  const [form, setForm] = useState<ShiftInput>(() => toFormData(initialData));
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu ca.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
      <form onSubmit={submit} className="w-full max-w-xl space-y-5 rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900" aria-label={initialData ? "Cập nhật ca" : "Tạo ca mới"}>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{initialData ? "Cập nhật ca" : "Tạo ca mới"}</h2>
          <p className="mt-1 text-sm text-slate-500">Ca qua đêm được hỗ trợ; giờ kết thúc sớm hơn giờ bắt đầu được tính sang ngày hôm sau.</p>
        </div>
        <label className="block text-sm font-medium">Tên ca
          <input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium">Bắt đầu
            <input required type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" />
          </label>
          <label className="text-sm font-medium">Kết thúc
            <input required type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" />
          </label>
          <label className="text-sm font-medium">Phút nghỉ
            <input required type="number" min={0} max={1440} step={1} value={form.breakMinutes} onChange={(event) => setForm({ ...form, breakMinutes: Number(event.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700" />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive ?? true} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          Đang hoạt động
        </label>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2">Hủy</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{saving ? "Đang lưu…" : "Lưu"}</button>
        </div>
      </form>
    </div>
  );
}
