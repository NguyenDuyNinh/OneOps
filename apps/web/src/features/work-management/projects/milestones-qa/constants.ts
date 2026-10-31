import type {
  MilestoneStatus,
  QaOutcome,
} from "@/features/work-management/projects/milestones-qa/types";

type Field = {
  key: string;
  label: string;
  type: string;
  options?: readonly string[];
};

export const statusLabel: Record<MilestoneStatus, string> = {
  PLANNED: "Lên kế hoạch",
  IN_PROGRESS: "Đang triển khai",
  COMPLETED: "Hoàn thành",
  MISSED: "Trễ hạn",
  CANCELLED: "Đã hủy",
};

export const definition = {
  id: "work-management/milestones",
  icon: 3,
  label: "Mốc & QA",
  title: "Mốc & QA",
  singular: "mốc",
  dateLabel: "Ngày đích",
  personLabel: "Người phụ trách",
  tabs: [],
  sections: [],
  statuses: Object.values(statusLabel),
  fields: [
    {
      key: "contractRef",
      label: "Tham chiếu hợp đồng",
      type: "text",
    },
    {
      key: "projectId",
      label: "Dự án",
      type: "text",
    },
  ],
  navigation: {
    title: "Mốc & QA",
    collapsed: false,
    defaultSection: "Tất cả",
    allSection: "Tất cả",
    items: [
      {
        label: "Tất cả",
        href: "/work-management/milestones",
      },
      ...(Object.entries(statusLabel) as [MilestoneStatus, string][]).map(
        ([value, label]) => ({
          label,
          href: `/work-management/milestones?status=${value}&section=${label}`,
        }),
      ),
    ],
  },
} as const;

export const fields: readonly Field[] = definition.fields;

export const statusTone: Record<
  MilestoneStatus,
  "neutral" | "info" | "success" | "danger" | "warning"
> = {
  PLANNED: "neutral",
  IN_PROGRESS: "info",
  COMPLETED: "success",
  MISSED: "danger",
  CANCELLED: "neutral",
};

export const moveLabel: Record<MilestoneStatus, string> = {
  PLANNED: "Đưa về kế hoạch",
  IN_PROGRESS: "Bắt đầu triển khai",
  COMPLETED: "Đánh dấu hoàn thành",
  MISSED: "Đánh dấu trễ hạn",
  CANCELLED: "Hủy mốc",
};

export const outcomeLabel: Record<QaOutcome, string> = {
  PASS: "Đạt",
  FAIL: "Không đạt",
  BLOCKED: "Bị chặn",
};

export const outcomeTone: Record<QaOutcome, "success" | "danger" | "warning"> =
  {
    PASS: "success",
    FAIL: "danger",
    BLOCKED: "warning",
  };

/** Office-time date so the UI and the API agree on "today". */
export function officeToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function progressOf(milestone: {
  completedCount: number;
  itemCount: number;
}) {
  if (!milestone.itemCount) return 0;
  return Math.round((milestone.completedCount / milestone.itemCount) * 100);
}
