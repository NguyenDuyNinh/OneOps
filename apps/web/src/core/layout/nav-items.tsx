"use client";

import React from "react";
import {
  AlertIcon,
  BoxCubeIcon,
  BoxIcon,
  CheckCircleIcon,
  DollarLineIcon,
  BoltIcon,
  CalenderIcon,
  DocsIcon,
  FileIcon,
  GridIcon,
  ListIcon,
  LockIcon,
  PageIcon,
  PieChartIcon,
  TableIcon,
  UserCircleIcon,
  UserIcon,
  VideoIcon,
} from "@/icons";

export type SubMenuItem = {
  name: string;
  path: string;
  icon?: React.ReactNode;
  pro?: boolean;
  new?: boolean;
};

export type NavSection = {
  /** Tên nhóm — hiển thị dưới icon ở rail + làm chú thích khi hover. */
  name: string;
  icon: React.ReactNode;
  /** Trang chính của nhóm — BẤM icon là vào thẳng trang này. */
  path: string;
  /** Các trang con — hiển thị trong panel khi bấm nút mở rộng đáy rail. */
  items?: SubMenuItem[];
};

/**
 * Đăng ký navigation cho webapp quản lý.
 * - Bấm tile trên rail → sang thẳng `path` của nhóm.
 * - Nút mở rộng đáy rail → panel hiện các `items` để chọn trang chi tiết.
 * Thêm nghiệp vụ mới: thêm 1 entry + route tương ứng.
 *
 * Toàn bộ trang quản trị nằm dưới tiền tố `/admin`.
 * Riêng nhóm Auth trỏ ra ngoài khu vực bảo vệ (`/signin`, `/signup`).
 */
export const navSections: NavSection[] = [
  {
    name: "General",
    icon: <GridIcon />,
    path: "/admin",
    items: [
      { name: "Ecommerce", path: "/admin", icon: <DollarLineIcon />, pro: false },
      { name: "Blank", path: "/admin/blank", icon: <FileIcon />, pro: false },
      { name: "Calendar", path: "/admin/calendar", icon: <CalenderIcon />, pro: false },
    ],
  },
  { name: "Users", icon: <UserCircleIcon />, path: "/admin/profile" },
  {
    name: "Charts",
    icon: <PieChartIcon />,
    path: "/admin/line-chart",
    items: [
      { name: "Line Chart", path: "/admin/line-chart", icon: <GridIcon />, pro: false },
      { name: "Bar Chart", path: "/admin/bar-chart", icon: <PieChartIcon />, pro: false },
    ],
  },
  {
    name: "Ui Elements",
    icon: <BoxCubeIcon />,
    path: "/admin/alerts",
    items: [
      { name: "Alerts", path: "/admin/alerts", icon: <AlertIcon />, pro: false },
      { name: "Avatars", path: "/admin/avatars", icon: <UserIcon />, pro: false },
      { name: "Badge", path: "/admin/badge", icon: <CheckCircleIcon />, pro: false },
      { name: "Buttons", path: "/admin/buttons", icon: <BoltIcon />, pro: false },
      { name: "Images", path: "/admin/images", icon: <BoxIcon />, pro: false },
      { name: "Modals", path: "/admin/modals", icon: <DocsIcon />, pro: false },
    ],
  },
  { name: "Forms", icon: <ListIcon />, path: "/admin/form-elements" },
  { name: "Tables", icon: <TableIcon />, path: "/admin/basic-tables" },
  { name: "Pages", icon: <PageIcon />, path: "/admin/blank" },
  {
    name: "Auth",
    icon: <LockIcon />,
    path: "/signin",
    items: [
      { name: "Sign In", path: "/signin", icon: <LockIcon />, pro: false },
      { name: "Sign Up", path: "/signup", icon: <UserCircleIcon />, pro: false },
    ],
  },
  { name: "Media", icon: <VideoIcon />, path: "/admin/videos" },
  { name: "Blank", icon: <FileIcon />, path: "/admin/blank" },
];
