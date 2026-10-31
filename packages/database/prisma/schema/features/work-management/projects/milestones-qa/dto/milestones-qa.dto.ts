import { z } from "zod";

export const MILESTONE_STATUSES = [
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "MISSED",
  "CANCELLED",
] as const;
export const milestoneStatusSchema = z.enum(MILESTONE_STATUSES);
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];
export const MILESTONE_TERMINAL: readonly MilestoneStatus[] = [
  "COMPLETED",
  "CANCELLED",
];
/** Allowed moves from the effective status; `MISSED` is derived from the target date. */
export const MILESTONE_MOVES: Record<MilestoneStatus, MilestoneStatus[]> = {
  PLANNED: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  MISSED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const QA_OUTCOMES = ["PASS", "FAIL", "BLOCKED"] as const;
export const qaOutcomeSchema = z.enum(QA_OUTCOMES);
export type QaOutcome = (typeof QA_OUTCOMES)[number];

const milestoneFields = {
  projectId: z.uuid(),
  name: z.string().trim().min(1).max(300),
  description: z.string().trim().max(2000),
  targetDate: z.iso.date(),
  contractRef: z.string().trim().max(200),
  status: milestoneStatusSchema,
};
export const createMilestoneSchema = z
  .object({
    ...milestoneFields,
    description: milestoneFields.description.default(""),
    contractRef: milestoneFields.contractRef.default(""),
    status: milestoneFields.status.default("PLANNED"),
  })
  .strict();
export const updateMilestoneSchema = z
  .object(milestoneFields)
  .omit({ projectId: true })
  .partial()
  .extend({ version: z.number().int().positive() })
  .strict();
export const milestoneListQuery = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(100),
    q: z.string().trim().max(200).optional(),
    projectId: z.uuid().optional(),
    status: milestoneStatusSchema.optional(),
  })
  .strict();
export const linkTasksSchema = z
  .object({ taskIds: z.array(z.uuid()).min(1).max(200) })
  .strict();
export const evidenceSchema = z
  .object({
    label: z.string().trim().min(1).max(200),
    url: z.url().max(2000),
  })
  .strict();
export const acceptanceFields = {
  title: z.string().trim().min(1).max(500),
  steps: z.string().trim().max(2000),
  expected: z.string().trim().max(1000),
  mandatory: z.boolean(),
};
export const createAcceptanceSchema = z
  .object({
    taskId: z.uuid(),
    ...acceptanceFields,
    steps: acceptanceFields.steps.default(""),
    expected: acceptanceFields.expected.default(""),
    mandatory: acceptanceFields.mandatory.default(true),
  })
  .strict();
export const updateAcceptanceSchema = z
  .object(acceptanceFields)
  .partial()
  .extend({ version: z.number().int().positive() })
  .strict();
export const resultInput = z
  .object({
    outcome: qaOutcomeSchema,
    note: z.string().trim().max(2000).default(""),
    evidence: z.array(evidenceSchema).max(20).default([]),
  })
  .strict();
export const acceptanceQuery = z.object({ taskId: z.uuid() }).strict();
export const versionSchema = z
  .object({ version: z.number().int().positive() })
  .strict();
export const milestoneTaskSchema = z
  .object({
    taskId: z.uuid(),
    code: z.string(),
    name: z.string(),
    status: z.string(),
    completed: z.boolean(),
  })
  .strict();
export const milestoneSchema = z
  .object({
    ...milestoneFields,
    id: z.uuid(),
    storedStatus: milestoneStatusSchema,
    itemCount: z.number().int().min(0),
    completedCount: z.number().int().min(0),
    overdue: z.boolean(),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export const acceptanceResultSchema = z
  .object({
    id: z.uuid(),
    itemId: z.uuid(),
    outcome: qaOutcomeSchema,
    note: z.string(),
    evidence: z.array(evidenceSchema),
    testedByName: z.string(),
    isOverride: z.boolean(),
    createdAt: z.iso.datetime(),
  })
  .strict();
export const acceptanceItemSchema = z
  .object({
    ...acceptanceFields,
    id: z.uuid(),
    taskId: z.uuid(),
    version: z.number().int().positive(),
    latestResult: acceptanceResultSchema.nullable(),
    resultCount: z.number().int().min(0),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export const qaGateSchema = z
  .object({
    required: z.boolean(),
    passed: z.boolean(),
    blocking: z.array(z.string()),
  })
  .strict();
export type MilestoneInput = z.input<typeof createMilestoneSchema>;
export type MilestoneDto = z.infer<typeof milestoneSchema>;
export type MilestoneTaskDto = z.infer<typeof milestoneTaskSchema>;
export type MilestoneListQuery = z.infer<typeof milestoneListQuery>;
export type AcceptanceInput = z.input<typeof createAcceptanceSchema>;
export type AcceptancePatch = z.infer<typeof updateAcceptanceSchema>;
export type AcceptanceItemDto = z.infer<typeof acceptanceItemSchema>;
export type AcceptanceResultDto = z.infer<typeof acceptanceResultSchema>;
export type ResultInput = z.input<typeof resultInput>;
export type QaGate = z.infer<typeof qaGateSchema>;
