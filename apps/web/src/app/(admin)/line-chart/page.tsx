import LineChartOne from "@/features/charts/LineChartOne";
import ComponentCard from "@/core/shared/ComponentCard";
import PageBreadcrumb from "@/core/shared/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Line Chart | Hoàng Hà Digital",
  description: "Trang Line Chart page forHoàng Hà Digital",
};
export default function LineChart() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Line Chart" />
      <div className="space-y-6">
        <ComponentCard title="Line Chart 1">
          <LineChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
