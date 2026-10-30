import type { Metadata } from "next";
import { PageBreadcrumb } from "@/features/admin/users";
import { ShiftsScreen } from "@/features/admin/shifts/components/ShiftsScreen";
import type { ShiftAccessContext } from "@/features/admin/shifts/types/shifts.types";

export const metadata: Metadata = {
  title: "Quản lý ca làm việc | OneOps",
  description:
    "Quản lý danh sách ca làm việc, giờ bắt đầu, giờ kết thúc và trạng thái ca",
};

export default function ShiftsPage() {
  const access: ShiftAccessContext = {
    employeeId: "",
    departmentIds: [],
    permissions: [],
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0">
        <PageBreadcrumb pageTitle="Quản lý ca làm việc" />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ShiftsScreen />
      </div>
    </div>
  );
}