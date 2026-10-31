export const definition = {
  id: "tenant-system/auth",
  icon: 9,
  label: "Đăng nhập",
  title: "Đăng nhập OneOps",
  singular: "phiên đăng nhập",
  dateLabel: "Gần nhất",
  personLabel: "Người dùng",
  tabs: [],
  sections: [],
  statuses: [],
  fields: [],
  navigation: {
    title: "Đăng nhập",
    collapsed: true,
    defaultSection: "",
    allSection: "",
    items: [],
  },
} as const;

export const roleLabels = {
  EMPLOYEE: "Nhân viên",
  MANAGER: "Quản lý",
} as const;

export const messages = {
  wrongCredentials: "Tên đăng nhập hoặc mật khẩu không đúng.",
  offline: "Không thể kết nối API. Vui lòng thử lại.",
  expired: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
} as const;
