import { z } from "zod";

export const PERIOD_STATUSES = [
  "OPEN",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
] as const;
export const periodStatusSchema = z.enum(PERIOD_STATUSES);
export type PeriodStatus = (typeof PERIOD_STATUSES)[number];

/** Minutes are entered in 15-minute steps and capped by a working day. */
export const MINUTE_STEP = 15;
export const DAY_LIMIT_MINUTES = 720;
/** Above this daily or weekly total the period needs a reason and a Manager. */
export const DAY_THRESHOLD_MINUTES = 480;
export const WEEK_THRESHOLD_MINUTES = 2400;

export const openPeriodSchema = z
  .object({ weekStart: z.iso.date().optional() })
  .strict();
export const entryInput = z
  .object({
    workDate: z.iso.date(),
    minutes: z.number().int().min(MINUTE_STEP).max(DAY_LIMIT_MINUTES),
    projectId: z.uuid().optional(),
    taskId: z.uuid().optional(),
    note: z.string().trim().max(1000).default(""),
    billable: z.boolean().default(false),
  })
  .strict();
export const entryPatch = z
  .object({
    workDate: z.iso.date().optional(),
    minutes: z
      .number()
      .int()
      .min(MINUTE_STEP)
      .max(DAY_LIMIT_MINUTES)
      .optional(),
    projectId: z.uuid().nullable().optional(),
    taskId: z.uuid().nullable().optional(),
    note: z.string().trim().max(1000).optional(),
    billable: z.boolean().optional(),
    version: z.number().int().positive(),
  })
  .strict();
export const decisionInput = z
  .object({
    decision: z.enum(["APPROVE", "REJECT"]),
    note: z.string().trim().max(1000).default(""),
  })
  .strict();
export const adjustmentInput = z
  .object({
    deltaMinutes: z
      .number()
      .int()
      .min(-DAY_LIMIT_MINUTES)
      .max(DAY_LIMIT_MINUTES),
    note: z.string().trim().min(1).max(1000),
  })
  .strict();
export const periodListQuery = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(100),
    employeeId: z.string().trim().max(100).optional(),
    status: periodStatusSchema.optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
  })
  .strict();
export const versionSchema = z
  .object({ version: z.number().int().positive() })
  .strict();
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
export const periodDetailSchema = periodSchema.extend({
  entries: z.array(entrySchema),
  adjustments: z.array(adjustmentSchema),
});
export type PeriodInput = z.infer<typeof openPeriodSchema>;
export type EntryInput = z.input<typeof entryInput>;
export type EntryOutput = z.infer<typeof entrySchema>;
export type PeriodDto = z.infer<typeof periodSchema>;
export type PeriodDetail = z.infer<typeof periodDetailSchema>;
export type AdjustmentDto = z.infer<typeof adjustmentSchema>;
export type PeriodListQuery = z.infer<typeof periodListQuery>;
export type DecisionInput = z.infer<typeof decisionInput>;
export type AdjustmentInput = z.input<typeof adjustmentInput>;
