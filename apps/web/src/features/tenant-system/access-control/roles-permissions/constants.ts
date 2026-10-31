import type {
  FeatureGroup,
  PermissionAction,
  PermissionRole,
} from "@/features/tenant-system/access-control/roles-permissions/types";

export const roleLabels: Record<PermissionRole, string> = {
  EMPLOYEE: "Nhân viên",
  MANAGER: "Quản lý",
};
export const roleOrder: readonly PermissionRole[] = ["EMPLOYEE", "MANAGER"];

/** `manage` is listed last and stays read-only: only system administrators hold it. */
export const actionLabels: Record<PermissionAction, string> = {
  view: "Xem",
  create: "Tạo",
  update: "Sửa",
  delete: "Xóa",
  approve: "Duyệt",
  manage: "Quản trị",
};
export const assignableActions: readonly PermissionAction[] = [
  "view",
  "create",
  "update",
  "delete",
  "approve",
];

export const groupLabels: Record<FeatureGroup, string> = {
  "tenant-system": "Hệ thống & quản trị",
  "work-management": "Công việc",
  "hr-management": "Nhân sự",
  crm: "Khách hàng",
};
export const groupOrder: readonly FeatureGroup[] = [
  "tenant-system",
  "work-management",
  "hr-management",
  "crm",
];

export const messages = {
  saved: "Đã lưu ma trận quyền.",
  denied: "Vai trò của bạn không có quyền xem ma trận quyền.",
  readOnly:
    "Bạn chỉ xem được ma trận. Chỉ quản trị hệ thống mới sửa được quyền.",
  load: "Không tải được ma trận quyền",
  save: "Không lưu được ma trận quyền",
  empty: "Chưa có chức năng nào trong danh mục quyền.",
  history: "Chưa có thay đổi quyền nào được ghi.",
  noChange: "Chưa có thay đổi nào cần lưu.",
};

export const definition = {
  id: "tenant-system/roles-permissions",
  icon: 9,
  label: "Phân quyền",
  title: "Ma trận quyền theo chức năng",
  singular: "quyền",
  dateLabel: "Cập nhật",
  personLabel: "Người thực hiện",
  tabs: [],
  sections: [],
  statuses: [],
  fields: [],
  navigation: {
    title: "Phân quyền",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      { label: "Tất cả", href: "/tenant-system/roles-permissions" },
      {
        label: "Hệ thống",
        href: "/tenant-system/roles-permissions?group=tenant-system&section=Hệ thống",
      },
      {
        label: "Công việc",
        href: "/tenant-system/roles-permissions?group=work-management&section=Công việc",
      },
      {
        label: "Nhân sự",
        href: "/tenant-system/roles-permissions?group=hr-management&section=Nhân sự",
      },
      {
        label: "Khách hàng",
        href: "/tenant-system/roles-permissions?group=crm&section=Khách hàng",
      },
    ],
  },
} as const;
