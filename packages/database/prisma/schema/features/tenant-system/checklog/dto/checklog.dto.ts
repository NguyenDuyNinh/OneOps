import { z } from "zod";

export const AUDIT_RESULTS = ["SUCCESS", "DENIED", "FAILED"] as const;
export const auditResultSchema = z.enum(AUDIT_RESULTS);

const text = (max: number) => z.string().trim().max(max);

/** Producer payload: optional fields default here, actor fields are added by the sink. */
export const auditEntryInputSchema = z
  .object({
    featureKey: z.string().trim().min(1).max(120),
    action: z.string().trim().min(1).max(60),
    targetType: text(60).default(""),
    targetId: text(200).default(""),
    summary: z.string().trim().min(1).max(500),
    reason: text(500).default(""),
    before: z.unknown().optional(),
    after: z.unknown().optional(),
    isOutOfScopeOverride: z.boolean().default(false),
    result: auditResultSchema.default("SUCCESS"),
  })
  .strict();

export const auditEntrySchema = z
  .object({
    id: z.uuid(),
    featureKey: z.string().min(1).max(120),
    action: z.string().min(1).max(60),
    targetType: z.string().max(60),
    targetId: z.string().max(200),
    summary: z.string().max(500),
    reason: z.string().max(500),
    before: z.unknown().nullable(),
    after: z.unknown().nullable(),
    actorAccountId: z.uuid().nullable(),
    actorName: z.string().max(200),
    actorRole: z.string().max(20),
    isSystemAdmin: z.boolean(),
    isOutOfScopeOverride: z.boolean(),
    result: auditResultSchema,
    createdAt: z.iso.datetime(),
  })
  .strict();

export const listQuerySchema = z
  .object({
    q: text(200).optional(),
    feature: text(120).optional(),
    action: text(60).optional(),
    actor: text(200).optional(),
    result: auditResultSchema.optional(),
    override: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
  })
  .strict();

export const facetSchema = z
  .object({ key: z.string().min(1).max(200), count: z.number().int().min(0) })
  .strict();

export const facetsSchema = z
  .object({
    features: z.array(facetSchema),
    actions: z.array(facetSchema),
  })
  .strict();

export const pageSchema = z
  .object({
    items: z.array(auditEntrySchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
  })
  .strict();

/** What a producer hands to the audit sink; actor fields are added by the sink. */
export type AuditEntryInput = z.input<typeof auditEntryInputSchema>;
export type AuditEntryPayload = z.output<typeof auditEntryInputSchema>;
export type AuditEntryDto = z.infer<typeof auditEntrySchema>;
export type AuditResult = z.infer<typeof auditResultSchema>;
export type AuditPage = z.infer<typeof pageSchema>;
export type AuditFacets = z.infer<typeof facetsSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
