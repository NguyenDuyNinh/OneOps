import type { Shift, WeekDay } from "../types/shifts.types";

export const WEEK_DAYS: {
  value: WeekDay;
  label: string;
}[] = [
  { value: "MON", label: "T2" },
  { value: "TUE", label: "T3" },
  { value: "WED", label: "T4" },
  { value: "THU", label: "T5" },
  { value: "FRI", label: "T6" },
  { value: "SAT", label: "T7" },
  { value: "SUN", label: "CN" },
];

export function formatHours(hours: number): string {
  return Number.isInteger(hours)
    ? `${hours}h`
    : `${hours.toFixed(1)}h`;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Thời gian không hợp lệ: ${time}`);
  }

  return hours * 60 + minutes;
}

export function calculateShiftHours(shift: Shift): number {
  const start = toMinutes(shift.startTime);
  const end = toMinutes(shift.endTime);

  const duration =
    end >= start ? end - start : end + 24 * 60 - start;

  return Math.max(0, (duration - shift.breakMinutes) / 60);
}

export function calculateWeeklyHours(hours: number[]): number {
  return hours.reduce((total, hour) => total + hour, 0);
}

export function getWorkDays(hours: number[]): number {
  return hours.filter((hour) => hour > 0).length;
}