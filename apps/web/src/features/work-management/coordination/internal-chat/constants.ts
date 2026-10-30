type Field = {
  key: string;
  label: string;
  type: string;
  options?: readonly string[];
};
export const definition = {
  id: "work-management/internal-chat",
  icon: 7,
  label: "Trao đổi",
  title: "Trao đổi nhóm",
  singular: "chủ đề trao đổi",
  dateLabel: "Ngày bắt đầu",
  personLabel: "Người tạo",
  tabs: [],
  sections: [],
  statuses: ["Đang mở", "Đã đóng"],
  fields: [
    {
      key: "channel",
      label: "Kênh trao đổi",
      type: "text",
    },
    {
      key: "participants",
      label: "Người tham gia",
      type: "text",
    },
  ],
  navigation: {
    title: "Trao đổi",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/work-management/internal-chat",
      },
      {
        label: "Đang mở",
        href: "/work-management/internal-chat?status=Đang mở&section=Đang mở",
      },
      {
        label: "Đã đóng",
        href: "/work-management/internal-chat?status=Đã đóng&section=Đã đóng",
      },
    ],
  },
} as const;
export const fields: readonly Field[] = definition.fields;
