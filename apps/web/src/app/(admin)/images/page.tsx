import ComponentCard from "@/core/shared/ComponentCard";
import PageBreadcrumb from "@/core/shared/PageBreadCrumb";
import ResponsiveImage from "@/core/ui/images/ResponsiveImage";
import ThreeColumnImageGrid from "@/core/ui/images/ThreeColumnImageGrid";
import TwoColumnImageGrid from "@/core/ui/images/TwoColumnImageGrid";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Images | Hoàng Hà Digital",
  description: "Trang Images page forHoàng Hà Digital",
  // other metadata
};

export default function Images() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Images" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Responsive image">
          <ResponsiveImage />
        </ComponentCard>
        <ComponentCard title="Image in 2 Grid">
          <TwoColumnImageGrid />
        </ComponentCard>
        <ComponentCard title="Image in 3 Grid">
          <ThreeColumnImageGrid />
        </ComponentCard>
      </div>
    </div>
  );
}
