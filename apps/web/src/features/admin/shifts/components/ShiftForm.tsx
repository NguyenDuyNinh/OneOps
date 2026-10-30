"use client";

import {
  useEffect,
  useId,
  useState,
  type FormEvent,
} from "react";

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

const DAY_SHORT_LABELS: Record<string, string> = {
  MON: "T2",
  TUE: "T3",
  WED: "T4",
  THU: "T5",
  FRI: "T6",
  SAT: "T7",
  SUN: "CN",
};

function calculateDuration(
  startTime: string,
  endTime: string,
  breakMinutes: number,
) {
  if (!startTime || !endTime) return null;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  if (
    !Number.isFinite(startHour) ||
    !Number.isFinite(startMinute) ||
    !Number.isFinite(endHour) ||
    !Number.isFinite(endMinute)
  ) {
    return null;
  }

  const start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;

  // Hỗ trợ ca qua đêm, ví dụ 22:00–06:00.
  if (end <= start) {
    end += 24 * 60;
  }

  const totalMinutes = end - start;
  const actualMinutes = totalMinutes - breakMinutes;

  return {
    totalMinutes,
    actualMinutes,
    crossesMidnight: end > 24 * 60 || endTime <= startTime,
  };
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes} phút`;
  if (remainingMinutes === 0) return `${hours} giờ`;

  return `${hours} giờ ${remainingMinutes} phút`;
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: "clock" | "calendar" | "users" | "close" | "check" | "info";
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...common}
    >
      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}

      {name === "calendar" && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </>
      )}

      {name === "users" && (
        <>
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}

      {name === "close" && <path d="m18 6-12 12M6 6l12 12" />}

      {name === "check" && <path d="m5 12 4 4L19 6" />}

      {name === "info" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </>
      )}
    </svg>
  );
}

export function ShiftForm({
  open,
  initialData,
  saving = false,
  onClose,
  onSubmit,
}: ShiftFormProps) {
  const titleId = useId();
  const descriptionId = useId();

  const [form, setForm] = useState<ShiftPayload>(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      const { id: _id, ...payload } = initialData;

      setForm({
        ...EMPTY_FORM,
        ...payload,
        workDays: [...payload.workDays],
        description: payload.description ?? "",
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        workDays: [...EMPTY_FORM.workDays],
      });
    }

    setError("");
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, saving, onClose]);

  if (!open) return null;

  function updateForm<K extends keyof ShiftPayload>(
    key: K,
    value: ShiftPayload[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleDay(day: WeekDay) {
    setForm((current) => ({
      ...current,
      workDays: current.workDays.includes(day)
        ? current.workDays.filter((item) => item !== day)
        : [...current.workDays, day],
    }));

    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const code = form.code.trim();
    const breakMinutes = Number(form.breakMinutes);

    if (!name || !code) {
      setError("Vui lòng nhập đầy đủ tên ca và mã ca.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError("Vui lòng chọn giờ bắt đầu và giờ kết thúc.");
      return;
    }

    if (
      !Number.isInteger(breakMinutes) ||
      breakMinutes < 0 ||
      breakMinutes > 1440
    ) {
      setError("Thời gian nghỉ phải là số phút nguyên từ 0 đến 1440.");
      return;
    }

    if (form.workDays.length === 0) {
      setError("Vui lòng chọn ít nhất một ngày làm việc.");
      return;
    }

    const duration = calculateDuration(
      form.startTime,
      form.endTime,
      breakMinutes,
    );

    if (!duration || duration.actualMinutes <= 0) {
      setError(
        "Thời gian nghỉ phải nhỏ hơn tổng thời gian của ca làm việc.",
      );
      return;
    }

    try {
      await onSubmit({
        ...form,
        name,
        code,
        breakMinutes,
        workDays: [...form.workDays],
        description: form.description?.trim() ?? "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể lưu ca làm việc. Vui lòng thử lại.",
      );
    }
  }

  const duration = calculateDuration(
    form.startTime,
    form.endTime,
    Number(form.breakMinutes),
  );

  const inputClass =
    "block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-blue-500";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Icon name="clock" className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h2
                  id={titleId}
                  className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl"
                >
                  {initialData ? "Chỉnh sửa ca làm việc" : "Tạo ca làm việc"}
                </h2>

                <p
                  id={descriptionId}
                  className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm"
                >
                  Thiết lập thời gian, lịch làm việc và trạng thái của ca.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Đóng biểu mẫu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>

        {/* Form content */}
        <div className="max-h-[min(68vh,620px)] space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
          {/* Basic information */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Icon name="info" className="h-4 w-4" />
              </span>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Thông tin cơ bản
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block min-w-0">
                <span className={labelClass}>
                  Tên ca <span className="text-rose-500">*</span>
                </span>

                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(event) => {
                    updateForm("name", event.target.value);
                    setError("");
                  }}
                  placeholder="Ví dụ: Ca hành chính"
                  autoComplete="off"
                  maxLength={100}
                  required
                  disabled={saving}
                />
              </label>

              <label className="block min-w-0">
                <span className={labelClass}>
                  Mã ca <span className="text-rose-500">*</span>
                </span>

                <input
                  className={`${inputClass} font-mono uppercase`}
                  value={form.code}
                  onChange={(event) => {
                    updateForm(
                      "code",
                      event.target.value.toUpperCase(),
                    );
                    setError("");
                  }}
                  placeholder="Ví dụ: CA-HC"
                  autoComplete="off"
                  maxLength={50}
                  required
                  disabled={saving}
                />

                <span className="mt-1.5 block text-xs text-slate-400">
                  Mã định danh cho ca làm việc.
                </span>
              </label>
            </div>
          </section>

          {/* Working time */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                <Icon name="clock" className="h-4 w-4" />
              </span>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Thời gian làm việc
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>
                  Giờ bắt đầu <span className="text-rose-500">*</span>
                </span>

                <input
                  type="time"
                  className={inputClass}
                  value={form.startTime}
                  onChange={(event) => {
                    updateForm("startTime", event.target.value);
                    setError("");
                  }}
                  required
                  disabled={saving}
                />
              </label>

              <label className="block">
                <span className={labelClass}>
                  Giờ kết thúc <span className="text-rose-500">*</span>
                </span>

                <input
                  type="time"
                  className={inputClass}
                  value={form.endTime}
                  onChange={(event) => {
                    updateForm("endTime", event.target.value);
                    setError("");
                  }}
                  required
                  disabled={saving}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className={labelClass}>
                  Thời gian nghỉ giữa ca
                </span>

                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={1440}
                    step={1}
                    className={`${inputClass} pr-20`}
                    value={form.breakMinutes}
                    onChange={(event) => {
                      updateForm(
                        "breakMinutes",
                        event.target.value === ""
                          ? 0
                          : Number(event.target.value),
                      );
                      setError("");
                    }}
                    disabled={saving}
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    phút
                  </span>
                </div>
              </label>
            </div>

            {/* Duration summary */}
            {duration && duration.actualMinutes > 0 && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/60 p-4 dark:border-blue-900/60 dark:from-blue-950/40 dark:to-indigo-950/30">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400">
                    <Icon name="clock" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      Thời gian làm việc dự kiến
                    </p>

                    <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {formatDuration(duration.actualMinutes)}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Tổng thời gian ca:{" "}
                      {formatDuration(duration.totalMinutes)}
                      {" · "}
                      Nghỉ: {Number(form.breakMinutes)} phút
                    </p>

                    {duration.crossesMidnight && (
                      <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                        Ca làm việc kết thúc vào ngày hôm sau.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Working days */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Icon name="calendar" className="h-4 w-4" />
              </span>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ngày làm việc
                </h3>
              </div>
            </div>

            <fieldset>
              <legend className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                Chọn các ngày áp dụng cho ca làm việc.
              </legend>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {WEEK_DAYS.map((day) => {
                  const checked = form.workDays.includes(day.value);

                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={checked}
                      disabled={saving}
                      onClick={() => toggleDay(day.value)}
                      className={`group flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60 ${
                        checked
                          ? "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/15"
                          : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
                      }`}
                    >
                      <span className="text-sm">
                        {DAY_SHORT_LABELS[day.value] ?? day.label}
                      </span>

                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                          checked
                            ? "border-white/70 bg-white/15 text-white"
                            : "border-slate-300 text-transparent dark:border-slate-600"
                        }`}
                      >
                        {checked && (
                          <Icon name="check" className="h-3 w-3" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Đã chọn{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {form.workDays.length}/7
                  </span>{" "}
                  ngày
                </p>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    updateForm(
                      "workDays",
                      WEEK_DAYS.map((day) => day.value),
                    )
                  }
                  className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Chọn cả tuần
                </button>
              </div>
            </fieldset>
          </section>

          {/* Status and description */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Icon name="users" className="h-4 w-4" />
              </span>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Trạng thái và mô tả
              </h3>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className={labelClass}>Trạng thái ca</span>

                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      "status",
                      event.target.value as ShiftPayload["status"],
                    )
                  }
                  disabled={saving}
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>

                <span
                  className={`mt-2 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                    form.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      form.status === "ACTIVE"
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />

                  {form.status === "ACTIVE"
                    ? "Ca có thể được sử dụng"
                    : "Ca đang ngừng hoạt động"}
                </span>
              </label>

              <label className="block">
                <span className={labelClass}>Mô tả</span>

                <textarea
                  className={`${inputClass} min-h-24 resize-y leading-6`}
                  rows={3}
                  maxLength={500}
                  placeholder="Mô tả đặc điểm hoặc lưu ý của ca làm việc..."
                  value={form.description ?? ""}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  disabled={saving}
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {(form.description ?? "").length}/500 ký tự
                </p>
              </label>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400"
            >
              <span className="mt-0.5 shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
              </span>

              <p className="leading-6">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="hidden text-xs text-slate-400 sm:block">
            <span className="text-rose-500">*</span> Thông tin bắt buộc
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-90"
                    />
                  </svg>

                  Đang lưu...
                </>
              ) : (
                <>
                  <Icon name="check" className="h-4 w-4" />
                  {initialData ? "Lưu thay đổi" : "Tạo ca làm việc"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}