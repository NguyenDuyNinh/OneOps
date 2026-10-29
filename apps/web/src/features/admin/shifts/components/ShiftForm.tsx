"use client";

import { useEffect, useState, type FormEvent } from "react";
import type {
  Shift,
  ShiftPayload,
  WeekDay,
} from "../types/shifts.types";
import { WEEK_DAYS } from "../utils/shift.utils";

type ShiftFormProps = {
  open: boolean;
  initialData: Shift | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (payload: ShiftPayload) => Promise<void>;
};

const EMPTY_FORM: ShiftPayload = {
  name: "",
  code: "",
  startTime: "08:00",
  endTime: "17:00",
  breakMinutes: 60,
  workDays: ["MON", "TUE", "WED", "THU", "FRI"],
  status: "ACTIVE",
  description: "",
};

export function ShiftForm({
  open,
  initialData,
  saving = false,
  onClose,
  onSubmit,
}: ShiftFormProps) {
  const [form, setForm] = useState<ShiftPayload>(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      const { id: _id, ...payload } = initialData;
      setForm(payload);
    } else {
      setForm(EMPTY_FORM);
    }

    setError("");
  }, [open, initialData]);

  if (!open) return null;

  function toggleDay(day: WeekDay) {
    setForm((current) => ({
      ...current,
      workDays: current.workDays.includes(day)
        ? current.workDays.filter((item) => item !== day)
        : [...current.workDays, day],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.code.trim()) {
      setError("Vui lòng nhập tên ca và mã ca.");
      return;
    }

    if (form.workDays.length === 0) {
      setError("Vui lòng chọn ít nhất một ngày làm việc.");
      return;
    }

    if (
      !Number.isFinite(form.breakMinutes) ||
      form.breakMinutes < 0
    ) {
      setError("Thời gian nghỉ không hợp lệ.");
      return;
    }

    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        code: form.code.trim(),
        description: form.description?.trim() ?? "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể lưu ca.",
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg space-y-4 rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {initialData ? "Chỉnh sửa ca" : "Thêm ca"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Đóng
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Tên ca</span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Mã ca</span>
            <input
              className={inputClass}
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value })
              }
              required
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Giờ bắt đầu</span>
            <input
              type="time"
              className={inputClass}
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
              required
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Giờ kết thúc</span>
            <input
              type="time"
              className={inputClass}
              value={form.endTime}
              onChange={(e) =>
                setForm({ ...form, endTime: e.target.value })
              }
              required
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Nghỉ giữa ca (phút)</span>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.breakMinutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  breakMinutes: Number(e.target.value),
                })
              }
            />
          </label>

          <label className="space-y-1 text-sm">
            <span>Trạng thái</span>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as ShiftPayload["status"],
                })
              }
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Ngừng hoạt động</option>
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Ngày làm việc
          </legend>

          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const checked = form.workDays.includes(day.value);

              return (
                <button
                  key={day.value}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => toggleDay(day.value)}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    checked
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block space-y-1 text-sm">
          <span>Mô tả</span>
          <textarea
            className={inputClass}
            rows={3}
            value={form.description ?? ""}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}