"use client";

import { UserCircleIcon } from "@/icons";
import type { NavSection } from "@/features/admin/navigation";

/**
 * Navigation của module "quản lý tài khoản".
 *
 * Quy ước (bắt buộc cho mọi module bề mặt admin):
 * - File: `features/admin/<module>/nav.tsx`
 * - Export: `<camelCaseTênModule>Nav` (ở đây: `usersNav`)
 * - Giá trị: một `NavSection` duy nhất.
 *
 * `scripts/gen-nav.mjs` tự quét thư mục và ráp vào `navigation/generated.ts`, nên thêm màn
 * hình mới **không phải sửa file dùng chung nào**.
 */
export const usersNav: NavSection = {
  name: "Users",
  icon: <UserCircleIcon />,
  path: "/admin/users",
  items: [{ name: "Tài khoản", path: "/admin/users", icon: <UserCircleIcon />, pro: false }],
};
