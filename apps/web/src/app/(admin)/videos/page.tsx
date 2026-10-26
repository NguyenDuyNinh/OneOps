import PageBreadcrumb from "@/core/shared/PageBreadCrumb";
import VideosExample from "@/core/ui/video/VideosExample";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Videos | Hoàng Hà Digital",
  description: "Trang Videos page forHoàng Hà Digital",
};

export default function VideoPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Videos" />

      <VideosExample />
    </div>
  );
}
