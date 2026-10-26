import ComponentCard from "@/core/shared/ComponentCard";
import PageBreadcrumb from "@/core/shared/PageBreadCrumb";
import BasicTableOne from "@/features/tables/BasicTableOne";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Basic Table | Hoàng Hà Digital",
  description:
    "Trang Basic Table  page for Hoàng Hà Digital  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Basic Table" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
