import type { AuditResult } from "@/features/tenant-system/checklog/types";

export const resultLabels: Record<AuditResult, string> = {
  SUCCESS: "Thành công",
  DENIED: "Bị từ chối",
  FAILED: "Thất bại",
};
export const resultVariants: Record<
  AuditResult,
  "success" | "warning" | "danger"
> = {
  SUCCESS: "success",
  DENIED: "warning",
  FAILED: "danger",
};

/**
 * Actions are producer-defined; the sink only stores them. Known codes get a
 * Vietnamese label, anything else falls back to the raw code so a new producer
 * stays readable without a frontend release.
 */
export const actionLabels: Record<string, string> = {
  PERMISSION_CHANGE: "Thay đổi quyền",
};

export const actionLabel = (action: string) =>
  actionLabels[action] ?? action.replace(/_/g, " ").toLowerCase();

export const roleLabels: Record<string, string> = {
  EMPLOYEE: "Nhân viên",
  MANAGER: "Quản lý",
  SYSTEM: "Hệ thống",
};

export const overrideLabels = {
  all: "Mọi phạm vi",
  regular: "Trong phạm vi",
  override: "Ngoài phạm vi",
} as const;

export const messages = {
  load: "Không tải được nhật ký hệ thống",
  denied: "Vai trò của bạn không có quyền xem nhật ký hệ thống.",
  empty: "Chưa có bản ghi nhật ký nào.",
  filtered: "Không có bản ghi phù hợp với bộ lọc.",
  detail: "Không tải được chi tiết bản ghi.",
  immutable:
    "Nhật ký chỉ được ghi thêm. Hệ thống không có chức năng sửa hoặc xóa bản ghi.",
};

export const definition = {
  id: "tenant-system/checklog",
  icon: 11,
  label: "Nhật ký hệ thống",
  title: "Nhật ký hệ thống",
  singular: "bản ghi",
  dateLabel: "Thời điểm",
  personLabel: "Người thực hiện",
  tabs: [],
  sections: [],
  statuses: [],
  fields: [],
  navigation: {
    title: "Nhật ký",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      { label: "Tất cả", href: "/tenant-system/checklog" },
      {
        label: "Thay đổi quyền",
        href: "/tenant-system/checklog?action=PERMISSION_CHANGE&section=Thay đổi quyền",
      },
      {
        label: "Ngoài phạm vi",
        href: "/tenant-system/checklog?override=true&section=Ngoài phạm vi",
      },
    ],
  },
} as const;
