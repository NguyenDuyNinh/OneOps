"use client";

import { GridIcon, LockIcon, UserCircleIcon } from "@/icons";
import type { NavSection } from "./types";

/**
 * Các nhóm navigation **không thuộc module nghiệp vụ nào**.
 *
 * - `navFirst`: nhóm mở đầu (tổng quan `/admin`).
 * - `navLast`: nhóm đóng cuối (link đăng nhập/đăng ký — nằm ngoài khu vực bảo vệ).
 *
 * Mọi module khác (`features/admin/<module>/nav.tsx`) tự khai báo section của mình và
 * được chèn vào GIỮA hai nhóm này bởi `scripts/gen-nav.mjs`.
 * File này (cùng `navigation/`) do owner của bề mặt giữ — hiếm khi phải sửa.
 */

export const navFirst: NavSection[] = [
  {
    name: "General",
    icon: <GridIcon />,
    path: "/admin",
    items: [{ name: "Tổng quan", path: "/admin", icon: <GridIcon />, pro: false }],
  },
];

export const navLast: NavSection[] = [
  {
    name: "Auth",
    icon: <LockIcon />,
    path: "/signin",
    items: [
      { name: "Sign In", path: "/signin", icon: <LockIcon />, pro: false },
      { name: "Sign Up", path: "/signup", icon: <UserCircleIcon />, pro: false },
    ],
  },
];
