import {
  TASK_STATUSES,
  type TaskStatus,
} from "@/features/work-management/work/tasks/types";

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
  reviewerLabel: "Người kiểm tra",
  tabs: [],
  sections: [],
  statuses: TASK_STATUSES,
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
      ...TASK_STATUSES.map((status) => ({
        label: status,
        href: `/work-management/tasks?status=${status}&section=${status}`,
      })),
    ],
  },
} as const;

export const fields: readonly Field[] = definition.fields;

/** Statuses that still warn about a passed deadline (BR-ST-08). */
export const OPEN_STATUSES: readonly TaskStatus[] = [
  "Cần làm",
  "Đang làm",
  "Làm lại",
  "Chờ kiểm tra",
];

export const TERMINAL_STATUSES: readonly TaskStatus[] = [
  "Hoàn thành",
  "Đã hủy",
];

export const statusTone: Record<
  TaskStatus,
  "neutral" | "info" | "warning" | "success" | "danger"
> = {
  "Cần làm": "neutral",
  "Đang làm": "info",
  "Làm lại": "warning",
  "Chờ kiểm tra": "warning",
  "Hoãn lại": "neutral",
  "Hoàn thành": "success",
  "Đã hủy": "danger",
};

export const transitionLabel: Record<string, string> = {
  "TR-02": "Bắt đầu làm",
  "TR-03": "Gửi kiểm tra",
  "TR-04": "Xác nhận hoàn thành",
  "TR-05": "Yêu cầu làm lại",
  "TR-06": "Tạm hoãn",
  "TR-07": "Tiếp tục",
  "TR-08": "Hủy công việc",
  "TR-09": "Gửi kiểm tra lại",
};

/** Rules the API refuses to run without a written reason. */
export const reasonRequiredCodes: readonly string[] = [
  "TR-05",
  "TR-06",
  "TR-08",
];

export const transitionHint: Record<string, string> = {
  "TR-02": "Bắt đầu thực hiện công việc.",
  "TR-03": "Nộp kết quả cho Người kiểm tra.",
  "TR-04": "Các tiêu chí kiểm tra bắt buộc phải đạt.",
  "TR-05": "Trả công việc về Người thực hiện kèm lý do.",
  "TR-06": "Tạm dừng công việc; cần đề xuất để tiếp tục.",
  "TR-07": "Tiếp tục công việc ở trạng thái trước khi hoãn.",
  "TR-08": "Kết thúc công việc mà không hoàn thành.",
  "TR-09": "Gửi lại kết quả sau khi làm lại.",
};

export const proposalLabel: Record<string, string> = {
  HOLD: "Xin hoãn",
  CANCEL: "Xin hủy",
  DEADLINE: "Xin đổi Deadline",
};

export const proposalStateLabel: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  AUTO_CLOSED: "Tự đóng",
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

export function isLate(
  task: { date: string; status: TaskStatus },
  today = officeToday(),
) {
  return task.date < today && OPEN_STATUSES.includes(task.status);
}
