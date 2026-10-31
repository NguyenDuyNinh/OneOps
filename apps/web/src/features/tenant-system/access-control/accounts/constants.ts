export const roleLabels = {
  EMPLOYEE: "Nhân viên",
  MANAGER: "Quản lý",
} as const;
export const statusLabels = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
} as const;
export const changeKindLabels = {
  ROLE: "Vai trò",
  ADMIN: "Quản trị hệ thống",
  STATUS: "Trạng thái",
  PASSWORD: "Mật khẩu",
} as const;
// Giá trị dự phòng cho form; API luôn ghi lịch sử bằng tên của tài khoản đang
// đăng nhập khi request có phiên hợp lệ.
export const actorPlaceholder = "Quản trị viên";
export const definition = {
  id: "tenant-system/accounts",
  icon: 9,
  label: "Tài khoản",
  title: "Tài khoản và phân quyền",
  singular: "tài khoản",
  dateLabel: "Cập nhật",
  personLabel: "Người thực hiện",
  tabs: [],
  sections: [],
  statuses: ["ACTIVE", "LOCKED"],
  fields: [],
  navigation: {
    title: "Tài khoản",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/tenant-system/accounts",
      },
      {
        label: "Quản lý",
        href: "/tenant-system/accounts?role=MANAGER&section=Quản lý",
      },
      {
        label: "Nhân viên",
        href: "/tenant-system/accounts?role=EMPLOYEE&section=Nhân viên",
      },
      {
        label: "Đã khóa",
        href: "/tenant-system/accounts?status=LOCKED&section=Đã khóa",
      },
    ],
  },
} as const;
