import { z } from "zod";

export const PERIOD_STATUSES = [
  "OPEN",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
] as const;
export const periodStatusSchema = z.enum(PERIOD_STATUSES);
export type PeriodStatus = (typeof PERIOD_STATUSES)[number];

/** Minutes are captured in 15-minute steps and capped by a working day. */
export const MINUTE_STEP = 15;
export const DAY_LIMIT_MINUTES = 720;
export const DAY_THRESHOLD_MINUTES = 480;
export const WEEK_THRESHOLD_MINUTES = 2400;

/** A week can be edited while it is open or after a rejection. */
export const EDITABLE_STATUSES: readonly PeriodStatus[] = ["OPEN", "REJECTED"];

export const periodSchema = z
  .object({
    id: z.uuid(),
    employeeId: z.string(),
    employeeName: z.string(),
    weekStart: z.iso.date(),
    weekEnd: z.iso.date(),
    status: periodStatusSchema,
    totalMinutes: z.number().int(),
    overThreshold: z.boolean(),
    submittedAt: z.iso.datetime().nullable(),
    decidedAt: z.iso.datetime().nullable(),
    decidedByName: z.string(),
    decisionNote: z.string(),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type PeriodDto = z.infer<typeof periodSchema>;

export const entrySchema = z
  .object({
    id: z.uuid(),
    periodId: z.uuid(),
    employeeId: z.string(),
    projectId: z.uuid().nullable(),
    taskId: z.uuid().nullable(),
    workDate: z.iso.date(),
    minutes: z.number().int(),
    note: z.string(),
    billable: z.boolean(),
    status: z.string(),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type TimeEntry = z.infer<typeof entrySchema>;

export const adjustmentSchema = z
  .object({
    id: z.uuid(),
    entryId: z.uuid(),
    periodId: z.uuid(),
    deltaMinutes: z.number().int(),
    note: z.string(),
    adjustedByName: z.string(),
    createdAt: z.iso.datetime(),
  })
  .strict();
export type Adjustment = z.infer<typeof adjustmentSchema>;

export const periodDetailSchema = periodSchema.extend({
  entries: z.array(entrySchema),
  adjustments: z.array(adjustmentSchema),
});
export type PeriodDetail = z.infer<typeof periodDetailSchema>;

export const periodPageSchema = z.object({
  items: z.array(periodSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const entryInputSchema = z
  .object({
    workDate: z.iso.date(),
    minutes: z
      .number()
      .int()
      .min(MINUTE_STEP, "Thời lượng tối thiểu 15 phút.")
      .max(DAY_LIMIT_MINUTES, "Một ngày không vượt quá 12 giờ.")
      .refine(
        (minutes) => minutes % MINUTE_STEP === 0,
        "Thời lượng phải theo bước 15 phút.",
      ),
    note: z.string().trim().max(1000).default(""),
    billable: z.boolean().default(false),
  })
  .strict();

export const entryPatchSchema = z
  .object({
    workDate: z.iso.date().optional(),
    minutes: z
      .number()
      .int()
      .min(MINUTE_STEP)
      .max(DAY_LIMIT_MINUTES)
      .optional(),
    note: z.string().trim().max(1000).optional(),
    billable: z.boolean().optional(),
    version: z.number().int().positive(),
  })
  .strict();

export const decisionInputSchema = z
  .object({
    decision: z.enum(["APPROVE", "REJECT"]),
    note: z.string().trim().max(1000).default(""),
  })
  .strict()
  .refine((value) => value.decision !== "REJECT" || Boolean(value.note), {
    message: "Từ chối tuần công phải ghi lý do.",
    path: ["note"],
  });

export const adjustmentInputSchema = z
  .object({
    deltaMinutes: z
      .number()
      .int()
      .min(-DAY_LIMIT_MINUTES)
      .max(DAY_LIMIT_MINUTES)
      .refine((value) => value !== 0, "Mức điều chỉnh phải khác 0."),
    note: z.string().trim().min(1, "Cần ghi lý do điều chỉnh.").max(1000),
  })
  .strict();

export type EntryInput = z.input<typeof entryInputSchema>;
export type EntryPatch = Omit<z.input<typeof entryPatchSchema>, "version">;
export type DecisionInput = z.input<typeof decisionInputSchema>;
export type AdjustmentInput = z.input<typeof adjustmentInputSchema>;
