/** Statuses that no longer need a deadline warning (BR-ST-08). */
export const boardTerminalStatuses = ["Hoàn thành", "Đã hủy"] as const;

export const boardLaneHint: Record<string, string> = {
  "Cần làm": "Công việc đã sẵn sàng để bắt đầu.",
  "Đang làm": "Đang được thực hiện.",
  "Làm lại": "Người kiểm tra yêu cầu làm lại.",
  "Chờ kiểm tra": "Chờ Người kiểm tra xác nhận.",
  "Hoãn lại": "Tạm dừng, cần đề xuất tiếp tục.",
  "Hoàn thành": "Đã được xác nhận hoàn thành.",
  "Đã hủy": "Không tiếp tục thực hiện.",
};

export const isTerminalStatus = (status: string) =>
  (boardTerminalStatuses as readonly string[]).includes(status);
