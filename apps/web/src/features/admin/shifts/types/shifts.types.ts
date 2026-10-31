export type ShiftStatusFilter = "all" | "active" | "inactive";

export type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShiftInput = {
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  isActive?: boolean;
};

export type PaginatedShifts = {
  items: Shift[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DeleteShiftResponse = {
  id: string;
  isActive: boolean | null;
  deleted: boolean;
};

export type ShiftAssignment = {
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
};

export type ShiftScheduleItem = {
  assignmentId: string;
  workDate: string;
  employee: { id: string; name: string };
  shift: ShiftAssignment["shift"];
  assignedById: string;
  createdAt: string;
};

export type ShiftScheduleResponse = {
  from: string;
  to: string;
  items: ShiftScheduleItem[];
  total: number;
};
