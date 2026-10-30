type Field = {
  key: string;
  label: string;
  type: string;
  options?: readonly string[];
};
export const definition = {
  id: "work-management/knowledge-sop",
  icon: 8,
  label: "Ghi chú",
  title: "Ghi chú & tri thức",
  singular: "ghi chú",
  dateLabel: "Ngày ghi chú",
  personLabel: "Tác giả",
  tabs: [],
  sections: [],
  statuses: ["Bản nháp", "Đã xuất bản", "Lưu trữ"],
  fields: [
    {
      key: "category",
      label: "Thư mục",
      type: "text",
    },
    {
      key: "content",
      label: "Nội dung",
      type: "textarea",
    },
    {
      key: "tags",
      label: "Nhãn",
      type: "text",
    },
  ],
  navigation: {
    title: "Ghi chú",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/work-management/knowledge-sop",
      },
      {
        label: "Bản nháp",
        href: "/work-management/knowledge-sop?status=Bản nháp&section=Bản nháp",
      },
      {
        label: "Đã xuất bản",
        href: "/work-management/knowledge-sop?status=Đã xuất bản&section=Đã xuất bản",
      },
      {
        label: "Lưu trữ",
        href: "/work-management/knowledge-sop?status=Lưu trữ&section=Lưu trữ",
      },
    ],
  },
} as const;
export const fields: readonly Field[] = definition.fields;
