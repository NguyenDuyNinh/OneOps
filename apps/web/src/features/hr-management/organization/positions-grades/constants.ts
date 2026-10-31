export const statusLabels = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
} as const;
export const definition = {
  id: "hr-management/positions",
  icon: 6,
  label: "Chức danh & cấp bậc",
  title: "Chức danh & cấp bậc",
  singular: "chức danh",
  dateLabel: "Cập nhật",
  personLabel: "Ánh xạ nhân viên",
  tabs: [],
  sections: [],
  statuses: ["ACTIVE", "INACTIVE"],
  fields: [],
  navigation: {
    title: "Chức danh & cấp bậc",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/hr-management/positions",
      },
      {
        label: "Đang hoạt động",
        href: "/hr-management/positions?status=ACTIVE&section=Đang hoạt động",
      },
      {
        label: "Ngừng hoạt động",
        href: "/hr-management/positions?status=INACTIVE&section=Ngừng hoạt động",
      },
    ],
  },
} as const;
