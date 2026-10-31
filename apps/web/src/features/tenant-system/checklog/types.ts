import { z } from "zod";

export const auditResultSchema = z.enum(["SUCCESS", "DENIED", "FAILED"]);

export const auditEntrySchema = z
  .object({
    id: z.uuid(),
    featureKey: z.string(),
    action: z.string(),
    targetType: z.string(),
    targetId: z.string(),
    summary: z.string(),
    reason: z.string(),
    before: z.unknown().nullable(),
    after: z.unknown().nullable(),
    actorAccountId: z.uuid().nullable(),
    actorName: z.string(),
    actorRole: z.string(),
    isSystemAdmin: z.boolean(),
    isOutOfScopeOverride: z.boolean(),
    result: auditResultSchema,
    createdAt: z.iso.datetime(),
  })
  .strict();

export const auditPageSchema = z
  .object({
    items: z.array(auditEntrySchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
  })
  .strict();

export const auditFacetSchema = z
  .object({ key: z.string().min(1), count: z.number().int().min(0) })
  .strict();

export const auditFacetsSchema = z
  .object({
    features: z.array(auditFacetSchema),
    actions: z.array(auditFacetSchema),
  })
  .strict();

export type AuditResult = z.infer<typeof auditResultSchema>;
export type AuditEntry = z.infer<typeof auditEntrySchema>;
export type AuditPage = z.infer<typeof auditPageSchema>;
export type AuditFacet = z.infer<typeof auditFacetSchema>;
export type AuditFacets = z.infer<typeof auditFacetsSchema>;

/** Filters accepted by `GET /checklog`; empty strings are dropped before sending. */
export interface ListQuery {
  q: string;
  feature: string;
  action: string;
  actor: string;
  result: AuditResult | "";
  override: "true" | "false" | "";
  from: string;
  to: string;
  page: number;
  pageSize: number;
}
