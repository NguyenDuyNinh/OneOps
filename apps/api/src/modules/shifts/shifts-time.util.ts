/** Tính thời lượng thực theo phút; giờ kết thúc sớm hơn bắt đầu nghĩa là qua đêm. */
export function calculateShiftDurationMinutes(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  if (start === end) return 0;
  return end > start ? end - start : 24 * 60 - start + end;
}
