/** Tính thời lượng thực theo phút; giờ kết thúc sớm hơn bắt đầu nghĩa là qua đêm. */
export function calculateShiftDurationMinutes(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  if (start === end) return 0;
  return end > start ? end - start : 24 * 60 - start + end;
}

export interface ShiftInterval {
  startMinute: number;
  endMinute: number;
}

/** Creates UTC midnight without interpreting a date-only string in local time. */
export function toUtcDateOnly(workDate: string): Date {
  return new Date(`${workDate}T00:00:00.000Z`);
}

export function addUtcCalendarDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** Returns a half-open interval in absolute minutes from the Unix epoch. */
export function getShiftInterval(
  workDate: Date,
  startTime: string,
  endTime: string,
): ShiftInterval {
  const dayStartMinute = Math.floor(workDate.getTime() / 60_000);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const startMinuteOfDay = startHour * 60 + startMinute;
  const duration = calculateShiftDurationMinutes(startTime, endTime);
  const absoluteStart = dayStartMinute + startMinuteOfDay;

  return { startMinute: absoluteStart, endMinute: absoluteStart + duration };
}

export function shiftIntervalsOverlap(left: ShiftInterval, right: ShiftInterval): boolean {
  return left.startMinute < right.endMinute && right.startMinute < left.endMinute;
}
