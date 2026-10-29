export type ShiftStatusFilter = 'all' | 'active' | 'inactive';

export interface ShiftListItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedShifts {
  items: ShiftListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** DELETE result: null isActive means the Shift row was physically removed. */
export interface DeleteShiftResponse {
  id: string;
  isActive: boolean | null;
  deleted: boolean;
}

export interface ShiftAssignmentResponse {
  id: string;
  shiftId: string;
  employeeId: string;
  workDate: string;
  assignedById: string;
  createdAt: string;
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    isActive: boolean;
  };
}

export interface ShiftScheduleItem {
  assignmentId: string;
  workDate: string;
  employee: {
    id: string;
    name: string;
  };
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    isActive: boolean;
  };
  assignedById: string;
  createdAt: string;
}

export interface ShiftScheduleResponse {
  from: string;
  to: string;
  items: ShiftScheduleItem[];
  total: number;
}
