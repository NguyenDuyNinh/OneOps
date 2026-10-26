// [Dev 1] — Module Điểm Danh & Ca Làm Việc
// Sở hữu: Dev 1 | Contract của slice này nằm ngay trong module (không còn package shared-types).
// Payload request dùng class DTO (`dto/check-in.dto.ts`).

export enum WorkStatus {
  AT_OFFICE = 'AT_OFFICE',
  REMOTE = 'REMOTE',
  ON_DUTY = 'ON_DUTY',       // Đi công tác / gặp khách
  ON_LEAVE = 'ON_LEAVE',     // Đang nghỉ phép
  SICK_LEAVE = 'SICK_LEAVE', // Nghỉ ốm
  ABSENT = 'ABSENT',         // Vắng không phép
  NOT_CHECKED_IN = 'NOT_CHECKED_IN',
}

export enum CheckInLabel {
  ON_TIME = 'ON_TIME',
  LATE = 'LATE',
}

export enum CheckOutLabel {
  NORMAL = 'NORMAL',
  EARLY = 'EARLY',
  MISSING = 'MISSING',  // Quên check-out
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  status: WorkStatus;
  checkedInAt: Date;
  checkedOutAt?: Date;
  checkInLabel?: CheckInLabel;
  checkOutLabel?: CheckOutLabel;
  note?: string;
  workLocation?: string;  // Địa điểm khi ON_DUTY
  createdAt: Date;
  updatedAt: Date;
}

export interface HeadcountSummary {
  total: number;
  atOffice: number;
  remote: number;
  onDuty: number;
  onLeave: number;
  absent: number;
  notCheckedIn: number;
  updatedAt: Date;
}

export interface HeadcountEmployee {
  userId: string;
  name: string;
  avatarUrl?: string;
  status: WorkStatus;
  checkedInAt?: Date;
  note?: string;
}

export interface UpdateWorkStatusDto {
  status: WorkStatus;
  note?: string;
  workLocation?: string;
}

// ---------------------------------------------------------------------------
// Event payload (EventEmitter2)
// Module này phát `attendance.checked_in`; gateway + notifications lắng nghe.
// ---------------------------------------------------------------------------

export interface AttendanceCheckedInEvent {
  userId: string;
  attendanceId: string;
  status: string;
  checkedInAt: Date;
}
