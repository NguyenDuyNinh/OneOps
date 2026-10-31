import type { Metadata } from "next";
import { ShiftsScreen } from "@/features/admin/shifts/components/ShiftsScreen";

export const metadata: Metadata = {
  title: "Quản lý ca làm việc | OneOps",
  description:
    "Quản lý danh sách ca làm việc, giờ bắt đầu, giờ kết thúc và trạng thái ca",
};

export default function ShiftsPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-hidden">
        <ShiftsScreen />
      </div>
    </div>
  );
}
