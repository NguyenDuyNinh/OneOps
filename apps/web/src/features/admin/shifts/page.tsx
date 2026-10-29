"use client";

import { ShiftsScreen } from "./components/ShiftsScreen";
import type { ShiftAccessContext } from "./types/shifts.types";

export default function ShiftsPage() {
  // TODO: Thay bằng thông tin tài khoản và quyền lấy từ auth/session hiện có.
  const access: ShiftAccessContext = {
    employeeId: "",
    departmentIds: [],
    permissions: [],
  };

  return <ShiftsScreen access={access} />;
}