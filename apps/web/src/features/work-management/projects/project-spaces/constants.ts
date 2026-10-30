type Field = {
  key: string;
  label: string;
  type: string;
  options?: readonly string[];
};
export const definition = {
  id: "work-management/projects",
  icon: 3,
  label: "Dự án",
  title: "Dự án",
  singular: "dự án",
  dateLabel: "Ngày kết thúc",
  personLabel: "Quản lý dự án",
  tabs: [],
  sections: [],
  statuses: ["Lên kế hoạch", "Đang triển khai", "Tạm dừng", "Hoàn thành"],
  fields: [
    {
      key: "team",
      label: "Đội nhóm",
      type: "text",
    },
    {
      key: "progress",
      label: "Tiến độ (%)",
      type: "number",
    },
    {
      key: "objective",
      label: "Mục tiêu",
      type: "textarea",
    },
    {
      key: "members",
      label: "Thành viên",
      type: "text",
    },
  ],
  navigation: {
    title: "Dự án",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/work-management/projects",
      },
      {
        label: "Lên kế hoạch",
        href: "/work-management/projects?status=Lên kế hoạch&section=Lên kế hoạch",
      },
      {
        label: "Đang triển khai",
        href: "/work-management/projects?status=Đang triển khai&section=Đang triển khai",
      },
      {
        label: "Tạm dừng",
        href: "/work-management/projects?status=Tạm dừng&section=Tạm dừng",
      },
      {
        label: "Hoàn thành",
        href: "/work-management/projects?status=Hoàn thành&section=Hoàn thành",
      },
    ],
  },
} as const;
export const fields: readonly Field[] = definition.fields;
