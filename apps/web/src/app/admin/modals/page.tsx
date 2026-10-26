import PageBreadcrumb from "@/core/shared/PageBreadCrumb";
import DefaultModal from "@/features/forms/DefaultModal";
import FormInModal from "@/features/forms/FormInModal";
import FullScreenModal from "@/features/forms/FullScreenModal";
import ModalBasedAlerts from "@/features/forms/ModalBasedAlerts";
import VerticallyCenteredModal from "@/features/forms/VerticallyCenteredModal";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Modals | Hoàng Hà Digital",
  description: "Trang Modals page forHoàng Hà Digital",
  // other metadata
};

export default function Modals() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Modals" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
        <DefaultModal />
        <VerticallyCenteredModal />
        <FormInModal />
        <FullScreenModal />
        <ModalBasedAlerts />
      </div>
    </div>
  );
}
