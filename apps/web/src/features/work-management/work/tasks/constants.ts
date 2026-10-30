type Field = {
  key: string;
  label: string;
  type: string;
  options?: readonly string[];
};
export const definition = {
  id: "work-management/tasks",
  icon: 2,
  label: "Công việc",
  title: "Công việc",
  singular: "công việc",
  dateLabel: "Hạn hoàn thành",
  personLabel: "Người thực hiện",
  tabs: [],
  sections: [],
  statuses: ["Cần làm", "Đang thực hiện", "Chờ phản hồi", "Hoàn thành"],
  fields: [
    {
      key: "project",
      label: "Dự án",
      type: "text",
    },
    {
      key: "priority",
      label: "Mức ưu tiên",
      type: "select",
      options: ["Thấp", "Trung bình", "Cao", "Khẩn cấp"],
    },
    {
      key: "progress",
      label: "Tiến độ (%)",
      type: "number",
    },
    {
      key: "startDate",
      label: "Ngày bắt đầu",
      type: "date",
    },
    {
      key: "tags",
      label: "Nhãn",
      type: "text",
    },
  ],
  navigation: {
    title: "Công việc",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/work-management/tasks",
      },
      {
        label: "Cần làm",
        href: "/work-management/tasks?status=Cần làm&section=Cần làm",
      },
      {
        label: "Đang thực hiện",
        href: "/work-management/tasks?status=Đang thực hiện&section=Đang thực hiện",
      },
      {
        label: "Chờ phản hồi",
        href: "/work-management/tasks?status=Chờ phản hồi&section=Chờ phản hồi",
      },
      {
        label: "Hoàn thành",
        href: "/work-management/tasks?status=Hoàn thành&section=Hoàn thành",
      },
    ],
  },
} as const;
export const fields: readonly Field[] = definition.fields;
