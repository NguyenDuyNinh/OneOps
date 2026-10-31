export const statusLabels = {
  ACTIVE: "Đang làm việc",
  INACTIVE: "Đã nghỉ việc",
} as const;
export const definition = {
  id: "hr-management/employees",
  icon: 7,
  label: "Danh bạ nhân sự",
  title: "Danh bạ nhân sự",
  singular: "nhân viên",
  dateLabel: "Cập nhật",
  personLabel: "Quản lý trực tiếp",
  tabs: [],
  sections: [],
  statuses: ["ACTIVE", "INACTIVE"],
  fields: [],
  navigation: {
    title: "Danh bạ nhân sự",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/hr-management/employees",
      },
      {
        label: "Đang làm việc",
        href: "/hr-management/employees?status=ACTIVE&section=Đang làm việc",
      },
      {
        label: "Đã nghỉ việc",
        href: "/hr-management/employees?status=INACTIVE&section=Đã nghỉ việc",
      },
    ],
  },
} as const;
