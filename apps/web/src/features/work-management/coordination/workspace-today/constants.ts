type Field = {
  key: string;
  label: string;
  type: string;
  options?: readonly string[];
};
export const definition = {
  id: "",
  icon: 1,
  label: "Tổng quan",
  title: "Không gian làm việc",
  singular: "tiện ích",
  dateLabel: "Ngày tạo",
  personLabel: "Người sở hữu",
  tabs: [],
  sections: [],
  statuses: ["Đang dùng", "Đã ẩn"],
  fields: [
    {
      key: "url",
      label: "Đường dẫn",
      type: "url",
    },
    {
      key: "category",
      label: "Nhóm tiện ích",
      type: "text",
    },
  ],
  navigation: {
    title: "Tổng quan",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [],
  },
} as const;
export const fields: readonly Field[] = definition.fields;
