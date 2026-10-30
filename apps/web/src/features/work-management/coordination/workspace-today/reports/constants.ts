type Field = {
  key: string;
  label: string;
  type: string;
  options?: readonly string[];
};
export const definition = {
  id: "work-management/reports",
  icon: 9,
  label: "Báo cáo",
  title: "Báo cáo công việc",
  singular: "báo cáo",
  dateLabel: "Ngày báo cáo",
  personLabel: "Người phụ trách",
  tabs: [],
  sections: [],
  statuses: ["Bản nháp", "Đã phát hành"],
  fields: [
    {
      key: "period",
      label: "Kỳ báo cáo",
      type: "text",
    },
    {
      key: "goal",
      label: "Mục tiêu",
      type: "textarea",
    },
    {
      key: "result",
      label: "Kết quả",
      type: "textarea",
    },
  ],
  navigation: {
    title: "Báo cáo",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/work-management/reports",
      },
      {
        label: "Bản nháp",
        href: "/work-management/reports?status=Bản nháp&section=Bản nháp",
      },
      {
        label: "Đã phát hành",
        href: "/work-management/reports?status=Đã phát hành&section=Đã phát hành",
      },
    ],
  },
} as const;
export const fields: readonly Field[] = definition.fields;
