import { useMemo } from "react";

import type {
  Employee,
  Shift,
  ShiftAccessContext,
} from "../types/shifts.types";

export function useShiftPermissions(access: ShiftAccessContext) {
  return useMemo(() => {
    // Giai đoạn hiện tại: chưa kiểm tra quyền chi tiết.
    // Mọi người dùng truy cập được các chức năng quản lý ca.
    const hasPermission = (_permission: string): boolean => true;

    function canViewEmployee(_employee: Employee): boolean {
      return true;
    }

    function canViewShift(_shift: Shift): boolean {
      return true;
    }

    return {
      hasPermission,
      canViewEmployee,
      canViewShift,

      canViewAllEmployees: true,
      canViewDepartmentEmployees: true,
      canViewSelf: true,

      canViewAllShifts: true,
      canViewAssignedShifts: true,

      canCreateShift: true,
      canUpdateShift: true,
      canDeleteShift: true,
    };
  }, [access]);
}