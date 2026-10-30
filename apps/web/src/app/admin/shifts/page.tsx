import { Metadata } from "next";
import React from "react";
import { PageBreadcrumb } from "@/features/admin/users";
import { ShiftsScreen } from "@/features/admin/shifts/components/ShiftsScreen";

export const metadata: Metadata = {
  title: "Quản lý ca làm việc | OneOps",
  description: "Quản lý danh sách ca làm việc, giờ bắt đầu, giờ kết thúc và trạng thái ca",
};

export default function ShiftsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý ca làm việc" />
      <ShiftsScreen />
    </div>
  );
}