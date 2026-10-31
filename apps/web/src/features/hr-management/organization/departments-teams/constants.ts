export const statusLabels = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
} as const;
export const definition = {
  id: "hr-management/organization",
  icon: 6,
  label: "Cơ cấu tổ chức",
  title: "Cơ cấu tổ chức",
  singular: "phòng ban",
  dateLabel: "Cập nhật",
  personLabel: "Trưởng phòng",
  tabs: [],
  sections: [],
  statuses: ["ACTIVE", "INACTIVE"],
  fields: [],
  navigation: {
    title: "Cơ cấu tổ chức",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/hr-management/organization",
      },
      {
        label: "Đang hoạt động",
        href: "/hr-management/organization?status=ACTIVE&section=Đang hoạt động",
      },
      {
        label: "Ngừng hoạt động",
        href: "/hr-management/organization?status=INACTIVE&section=Ngừng hoạt động",
      },
    ],
  },
} as const;
