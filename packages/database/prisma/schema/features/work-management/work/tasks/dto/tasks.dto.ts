import { z } from "zod";

/**
 * Mirror of the approved workflow vocabulary. The workflow feature decides every
 * move; this schema only describes the value the aggregate stores and filters on.
 */
export const TASK_STATUSES = [
  "Cần làm",
  "Đang làm",
  "Làm lại",
  "Chờ kiểm tra",
  "Hoãn lại",
  "Hoàn thành",
  "Đã hủy",
] as const;
export const taskStatusSchema = z.enum(TASK_STATUSES);
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** A new task always starts at “Cần làm”; status changes only go through the workflow. */
export const INITIAL_TASK_STATUS: TaskStatus = "Cần làm";

const recordBase = z
  .object({
    code: z.string().trim().min(1).max(100),
    name: z.string().trim().min(1).max(500),
    scope: z.string().trim().max(250).default(""),
    date: z.iso.date(),
    assignee: z.string().trim().max(150).default(""),
    reviewer: z.string().trim().max(150).default(""),
    note: z.string().trim().max(2000).default(""),
  })
  .strict();
const recordPatch = recordBase
  .omit({ scope: true, assignee: true, reviewer: true, note: true })
  .partial()
  .extend({
    scope: z.string().trim().max(250).optional(),
    assignee: z.string().trim().max(150).optional(),
    reviewer: z.string().trim().max(150).optional(),
    note: z.string().trim().max(2000).optional(),
  });
export const listQuery = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(100),
    q: z.string().trim().max(500).optional(),
    scope: z.string().max(250).optional(),
    status: taskStatusSchema.optional(),
    assignee: z.string().trim().max(150).optional(),
    reviewer: z.string().trim().max(150).optional(),
    /** Comma separated ids, used by composition adapters that resolve many tasks at once. */
    ids: z
      .string()
      .trim()
      .max(8000)
      .refine(
        (value) =>
          !value ||
          value.split(",").every((id) => z.uuid().safeParse(id.trim()).success),
        { message: "Danh sách id không hợp lệ." },
      )
      .optional(),
  })
  .strict();
export const versionSchema = z
  .object({ version: z.number().int().positive() })
  .strict();

export const fieldsSchema = z
  .object({
    project: z.string().trim().max(1000).optional(),
    priority: z.enum(["Thấp", "Trung bình", "Cao", "Khẩn cấp"]).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    startDate: z.union([z.iso.date(), z.literal("")]).optional(),
    tags: z.string().trim().max(1000).optional(),
    checklist: z
      .array(
        z
          .object({
            id: z.uuid(),
            title: z.string().trim().min(1).max(500),
            done: z.boolean(),
          })
          .strict(),
      )
      .max(200)
      .optional(),
  })
  .strict();
export const createSchema = recordBase.extend({
  fields: fieldsSchema.default({}),
});
export const updateSchema = recordPatch
  .extend({
    fields: fieldsSchema.optional(),
    version: z.number().int().positive(),
  })
  .strict();
export const recordSchema = createSchema.extend({
  id: z.uuid(),
  module: z.literal("tasks"),
  status: taskStatusSchema,
  version: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export const validatedCreateSchema = createSchema.refine(
  (value) => !value.fields.startDate || value.fields.startDate <= value.date,
  { message: "Hạn hoàn thành phải từ ngày bắt đầu trở đi", path: ["date"] },
);
export type RecordInput = z.input<typeof createSchema>;
export type RecordOutput = z.infer<typeof recordSchema>;
export type RecordDto = RecordOutput;
export type ListQuery = z.infer<typeof listQuery>;
