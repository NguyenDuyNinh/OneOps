import { z } from "zod";

export const kanbanQuery = z
  .object({
    assignee: z.string().trim().max(150).optional(),
    status: z.string().trim().max(150).optional(),
    deadlineState: z.enum(["normal", "due-soon", "overdue"]).optional(),
    deadlineFrom: z.iso.date().optional(),
    deadlineTo: z.iso.date().optional(),
    includeCancelled: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(100),
  })
  .strict()
  .refine(
    (query) =>
      !query.deadlineFrom ||
      !query.deadlineTo ||
      query.deadlineFrom <= query.deadlineTo,
    { path: ["deadlineTo"], message: "Khoảng deadline không hợp lệ." },
  );

export type KanbanQuery = z.infer<typeof kanbanQuery>;
export type DeadlineState = "normal" | "due-soon" | "overdue" | "none";

export type KanbanTaskSnapshot = {
  id: string;
  status: string;
  date: string;
  version: number;
};

export type KanbanCard = {
  id: string;
  code: string;
  name: string;
  assignee: string;
  deadline: string;
  status: string;
  deadlineState: DeadlineState;
  commentCount: number;
  version: number;
};

export type KanbanBoardResponse = {
  summary: {
    total: number;
    completionRate: number;
    awaitingReview: number;
    paused: number;
    dueSoon: number;
    overdue: number;
  };
  lanes: { status: string; count: number; items: KanbanCard[] }[];
  total: number;
  page: number;
  pageSize: number;
  generatedAt: string;
};
