type Field = {
  key: string;
  label: string;
  type: string;
  options?: readonly string[];
};
export const definition = {
  id: "work-management/tickets-approvals",
  icon: 6,
  label: "Đề xuất",
  title: "Đề xuất & phê duyệt",
  singular: "đề xuất",
  dateLabel: "Hạn xử lý",
  personLabel: "Người duyệt",
  tabs: [],
  sections: [],
  statuses: ["Chờ duyệt", "Đã duyệt", "Từ chối", "Đã hủy"],
  fields: [
    {
      key: "category",
      label: "Loại đề xuất",
      type: "select",
      options: ["Mua sắm", "Nghỉ phép", "Thanh toán", "Khác"],
    },
    {
      key: "requester",
      label: "Người đề xuất",
      type: "text",
    },
    {
      key: "amount",
      label: "Số tiền dự kiến",
      type: "number",
    },
  ],
  navigation: {
    title: "Đề xuất",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/work-management/tickets-approvals",
      },
      {
        label: "Chờ duyệt",
        href: "/work-management/tickets-approvals?status=Chờ duyệt&section=Chờ duyệt",
      },
      {
        label: "Đã duyệt",
        href: "/work-management/tickets-approvals?status=Đã duyệt&section=Đã duyệt",
      },
      {
        label: "Từ chối",
        href: "/work-management/tickets-approvals?status=Từ chối&section=Từ chối",
      },
      {
        label: "Đã hủy",
        href: "/work-management/tickets-approvals?status=Đã hủy&section=Đã hủy",
      },
    ],
  },
} as const;
export const fields: readonly Field[] = definition.fields;
