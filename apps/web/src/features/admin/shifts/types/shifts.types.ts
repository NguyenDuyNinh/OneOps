export type EntityStatus = "ACTIVE" | "INACTIVE";

export type WeekDay =
  | "MON"
  | "TUE"
  | "WED"
  | "THU"
  | "FRI"
  | "SAT"
  | "SUN";

export type Employee = {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  departmentName: string;
  position: string;
  status: EntityStatus;
  shiftCode: string | null;
  weeklyHours: number[];
};

export type Shift = {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  workDays: WeekDay[];
  status: EntityStatus;
  description?: string;
};

export type ShiftPayload = Omit<Shift, "id">;

export type EmployeeQuery = {
  search?: string;
  status?: EntityStatus;
  departmentId?: string;
};

export type ShiftQuery = {
  search?: string;
  status?: EntityStatus;
};

export type ShiftPermission =
  | "employee.view.self"
  | "employee.view.department"
  | "employee.view.all"
  | "shift.view.assigned"
  | "shift.view.all"
  | "shift.create"
  | "shift.update"
  | "shift.delete";

export type ShiftAccessContext = {
  employeeId: string;
  departmentIds: string[];
  permissions: ShiftPermission[];
};

export type ApiListResponse<T> = {
  data: T[];
  total?: number;
};

export type ApiResponse<T> = {
  data: T;
};