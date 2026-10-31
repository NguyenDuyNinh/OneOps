import type {
  PeriodStatus,
  TimeEntry,
} from "@/features/work-management/projects/timesheets/types";
import {
  DAY_THRESHOLD_MINUTES,
  EDITABLE_STATUSES,
} from "@/features/work-management/projects/timesheets/types";

type Field = {
  key: string;
  label: string;
  type: string;
  options?: readonly string[];
};

export const statusLabel: Record<PeriodStatus, string> = {
  OPEN: "Đang mở",
  SUBMITTED: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
};

export const definition = {
  id: "work-management/timesheets",
  icon: 5,
  label: "Timesheet",
  title: "Timesheet",
  singular: "tuần công",
  dateLabel: "Tuần",
  personLabel: "Nhân sự",
  tabs: [],
  sections: [],
  statuses: Object.values(statusLabel),
  fields: [
    {
      key: "weekStart",
      label: "Tuần bắt đầu",
      type: "date",
    },
    {
      key: "note",
      label: "Ghi chú",
      type: "text",
    },
  ],
  navigation: {
    title: "Timesheet",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/work-management/timesheets",
      },
      ...(Object.entries(statusLabel) as [PeriodStatus, string][]).map(
        ([value, label]) => ({
          label,
          href: `/work-management/timesheets?status=${value}&section=${label}`,
        }),
      ),
    ],
  },
} as const;

export const fields: readonly Field[] = definition.fields;

export const statusTone: Record<
  PeriodStatus,
  "neutral" | "warning" | "success" | "danger"
> = {
  OPEN: "neutral",
  SUBMITTED: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export const isEditable = (status: PeriodStatus) =>
  EDITABLE_STATUSES.includes(status);

/** `450` → `7h30`, `480` → `8h`. */
export function formatMinutes(total: number) {
  const sign = total < 0 ? "-" : "";
  const abs = Math.abs(total);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${sign}${hours}h${minutes ? String(minutes).padStart(2, "0") : ""}`;
}

/** Office-time date so the UI and the API agree on "today". */
export function officeToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function shiftDate(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/** Monday of the week that contains `date` (ISO week). */
export function mondayOf(date: string) {
  const value = new Date(`${date}T00:00:00.000Z`);
  const weekday = value.getUTCDay() || 7;
  return shiftDate(date, 1 - weekday);
}

/** Minutes booked per day; a day above the threshold needs a reason. */
export function dayTotals(entries: readonly TimeEntry[]) {
  const totals = new Map<string, number>();
  for (const entry of entries)
    totals.set(
      entry.workDate,
      (totals.get(entry.workDate) ?? 0) + entry.minutes,
    );
  return totals;
}

export const dayNeedsReason = (minutes: number) =>
  minutes > DAY_THRESHOLD_MINUTES;

export const formatDay = (date: string) =>
  new Date(`${date}T00:00:00.000Z`).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
