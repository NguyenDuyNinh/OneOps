import { api } from "@/features/auth";
import type {
  DeleteShiftResponse,
  PaginatedShifts,
  Shift,
  ShiftInput,
  ShiftScheduleResponse,
  ShiftStatusFilter,
  ShiftAssignment,
} from "../types/shifts.types";

function queryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const shiftsApi = {
  list(input: {
    q?: string;
    status?: ShiftStatusFilter;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedShifts> {
    return api.get<PaginatedShifts>(
      `/shifts${queryString({
        page: input.page ?? 1,
        pageSize: input.pageSize ?? 10,
        q: input.q,
        status: input.status ?? "all",
      })}`,
    );
  },

  create(input: ShiftInput): Promise<Shift> {
    return api.post<Shift>("/shifts", input);
  },

  update(id: string, input: Partial<ShiftInput>): Promise<Shift> {
    return api.patch<Shift>(`/shifts/${encodeURIComponent(id)}`, input);
  },

  remove(id: string): Promise<DeleteShiftResponse> {
    return api.delete<DeleteShiftResponse>(
      `/shifts/${encodeURIComponent(id)}`,
    );
  },

  schedule(input: {
    from: string;
    to: string;
    employeeId?: string;
  }): Promise<ShiftScheduleResponse> {
    return api.get<ShiftScheduleResponse>(
      `/shifts/schedules${queryString(input)}`,
    );
  },

  assign(input: {
    shiftId: string;
    employeeId: string;
    workDate: string;
  }): Promise<ShiftAssignment> {
    return api.post<ShiftAssignment>("/shifts/assignments", input);
  },
};
