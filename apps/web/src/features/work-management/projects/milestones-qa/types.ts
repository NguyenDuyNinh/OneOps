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

/** New milestones may only start before the work begins (API rule). */
export const INITIAL_MILESTONE_STATUSES = ["PLANNED", "IN_PROGRESS"] as const;

export const TERMINAL_STATUSES: readonly MilestoneStatus[] = [
  "COMPLETED",
  "CANCELLED",
];

/** Moves mirrored from the API so the UI never offers an invalid status. */
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

export const evidenceSchema = z
  .object({
    label: z.string().trim().min(1).max(200),
    url: z.url().max(2000),
  })
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
export type MilestoneTask = z.infer<typeof milestoneTaskSchema>;

const milestoneFields = {
  name: z.string().trim().min(1).max(300),
  description: z.string().trim().max(2000),
  targetDate: z.iso.date(),
  contractRef: z.string().trim().max(200),
};

export const createSchema = z
  .object({
    projectId: z.uuid(),
    ...milestoneFields,
    description: milestoneFields.description.default(""),
    contractRef: milestoneFields.contractRef.default(""),
    status: z.enum(INITIAL_MILESTONE_STATUSES).default("PLANNED"),
  })
  .strict();

export const updateSchema = z
  .object({
    ...milestoneFields,
    status: milestoneStatusSchema,
  })
  .partial()
  .extend({ version: z.number().int().positive() })
  .strict();

export const milestoneSchema = z
  .object({
    id: z.uuid(),
    projectId: z.uuid(),
    ...milestoneFields,
    status: milestoneStatusSchema,
    storedStatus: milestoneStatusSchema,
    itemCount: z.number().int().min(0),
    completedCount: z.number().int().min(0),
    overdue: z.boolean(),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type MilestoneDto = z.infer<typeof milestoneSchema>;

export const milestoneDetailSchema = milestoneSchema.extend({
  items: z.array(milestoneTaskSchema),
});
export type MilestoneDetail = z.infer<typeof milestoneDetailSchema>;

export const milestonePageSchema = z.object({
  items: z.array(milestoneSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

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
export type AcceptanceResult = z.infer<typeof acceptanceResultSchema>;

export const acceptanceItemSchema = z
  .object({
    id: z.uuid(),
    taskId: z.uuid(),
    title: z.string(),
    steps: z.string(),
    expected: z.string(),
    mandatory: z.boolean(),
    version: z.number().int().positive(),
    latestResult: acceptanceResultSchema.nullable(),
    resultCount: z.number().int().min(0),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type AcceptanceItem = z.infer<typeof acceptanceItemSchema>;

export const qaGateSchema = z
  .object({
    required: z.boolean(),
    passed: z.boolean(),
    blocking: z.array(z.string()),
  })
  .strict();
export type QaGate = z.infer<typeof qaGateSchema>;

export const acceptancePageSchema = z.object({
  items: z.array(acceptanceItemSchema),
  gate: qaGateSchema,
});

export const acceptanceInputSchema = z
  .object({
    taskId: z.uuid(),
    title: z.string().trim().min(1).max(500),
    steps: z.string().trim().max(2000).default(""),
    expected: z.string().trim().max(1000).default(""),
    mandatory: z.boolean().default(true),
  })
  .strict();

export const acceptancePatchSchema = z
  .object({
    title: z.string().trim().min(1).max(500).optional(),
    steps: z.string().trim().max(2000).optional(),
    expected: z.string().trim().max(1000).optional(),
    mandatory: z.boolean().optional(),
  })
  .strict();

export const resultInputSchema = z
  .object({
    outcome: qaOutcomeSchema,
    note: z.string().trim().max(2000).default(""),
    evidence: z.array(evidenceSchema).max(20).default([]),
  })
  .strict();

/** Read-only reference to another domain, loaded through its public REST API. */
export const referenceSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  status: z.string(),
});

export type MilestoneInput = z.input<typeof createSchema>;
export type MilestoneUpdate = Omit<z.input<typeof updateSchema>, "version">;
export type AcceptanceInput = z.input<typeof acceptanceInputSchema>;
export type AcceptancePatch = z.input<typeof acceptancePatchSchema>;
export type ResultInput = z.input<typeof resultInputSchema>;
export type Reference = z.infer<typeof referenceSchema>;
