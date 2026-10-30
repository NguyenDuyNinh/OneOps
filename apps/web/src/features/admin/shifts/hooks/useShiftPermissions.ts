import { useMemo } from "react";

import type {
  Employee,
  Shift,
  ShiftAccessContext,
} from "../types/shifts.types";

export function useShiftPermissions(access: ShiftAccessContext) {
  return useMemo(() => {
    /**
     * TODO:
     * Thay các giá trị mặc định bằng kiểm tra quyền thực tế
     * theo cấu trúc ShiftAccessContext của dự án.
     *
     * Lưu ý: Đây chỉ là quyền giao diện, không thay thế
     * việc xác minh quyền tại API phía máy chủ.
     */
    const hasPermission = (_permission: string): boolean => true;

    const canViewEmployee = (_employee: Employee): boolean => true;

    const canViewShift = (_shift: Shift): boolean => true;

    return {
      hasPermission,
      canViewEmployee,
      canViewShift,

      canViewAllEmployees: hasPermission("employees.view.all"),
      canViewDepartmentEmployees: hasPermission(
        "employees.view.department",
      ),
      canViewSelf: hasPermission("employees.view.self"),

      canViewAllShifts: hasPermission("shifts.view.all"),
      canViewAssignedShifts: hasPermission("shifts.view.assigned"),

      canCreateShift: hasPermission("shifts.create"),
      canUpdateShift: hasPermission("shifts.update"),
      canDeleteShift: hasPermission("shifts.delete"),
    };
  }, [access]);
}