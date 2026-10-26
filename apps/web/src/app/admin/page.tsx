import type { Metadata } from "next";
import { EcommerceMetrics } from "@/features/dashboard/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/features/dashboard/MonthlyTarget";
import MonthlySalesChart from "@/features/dashboard/MonthlySalesChart";
import StatisticsChart from "@/features/dashboard/StatisticsChart";
import RecentOrders from "@/features/dashboard/RecentOrders";
import DemographicCard from "@/features/dashboard/DemographicCard";

export const metadata: Metadata = {
  title: "E-commerce Dashboard | Hoàng Hà Digital",
  description: "Trang Home của Hoàng Hà Digital",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics />

        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>

      <div className="col-span-12">
        <StatisticsChart />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div>
    </div>
  );
}
