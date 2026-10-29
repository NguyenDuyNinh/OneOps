import { PageBreadcrumb, UsersScreen } from "@/features/admin/users";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Quản lý tài khoản | OneOps",
  description: "Danh sách, phân quyền và trạng thái tài khoản người dùng OneOps",
};

export default function UsersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý tài khoản" />
      <UsersScreen />
    </div>
  );
}


