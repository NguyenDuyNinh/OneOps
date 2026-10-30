type Field = {
  key: string;
  label: string;
  type: string;
  options?: readonly string[];
};
export const definition = {
  id: "work-management/notifications",
  icon: 11,
  label: "Thông báo",
  title: "Thông báo",
  singular: "thông báo",
  dateLabel: "Thời gian",
  personLabel: "Người nhận",
  tabs: [],
  sections: [],
  statuses: [],
  fields: [],
  navigation: {
    title: "Thông báo",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/work-management/notifications",
      },
      {
        label: "Chưa đọc",
        href: "/work-management/notifications?unread=true&section=Chưa đọc",
      },
    ],
  },
} as const;
export const fields: readonly Field[] = definition.fields;
