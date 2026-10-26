import Calendar from "@/features/calendar/Calendar";
import PageBreadcrumb from "@/core/shared/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Calender | Hoàng Hà Digital",
  description: "Trang Calender page for Hoàng Hà Digital  Tailwind CSS Admin Dashboard Template",
  // other metadata
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendar" />
      <Calendar />
    </div>
  );
}
