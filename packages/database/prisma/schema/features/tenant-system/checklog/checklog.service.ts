import { Injectable } from "@nestjs/common";
import type { ActorContext } from "../../../core/auth/actor-context.js";
import type { Transaction } from "../../../core/database/database.module.js";
import { redact } from "./audit-redaction.js";
import { ChecklogRepository, type AuditRow } from "./checklog.repository.js";
import {
  auditEntryInputSchema,
  type AuditEntryInput,
  type AuditFacets,
  type AuditPage,
  type ListQuery,
} from "./dto/checklog.dto.js";

export const CHECKLOG_FEATURE = "tenant-system/checklog";

/**
 * Append-only audit sink. Features hand entries to the composition (`forRoot`
 * port) instead of importing this feature; the sink adds the actor, redacts
 * secret material and never exposes an update or delete path.
 */
@Injectable()
export class ChecklogService {
  constructor(private readonly repository: ChecklogRepository) {}

  async record(
    entries: readonly AuditEntryInput[],
    actor: ActorContext,
    tx?: Transaction,
  ) {
    if (!entries.length) return;
    const rows: AuditRow[] = entries.map((entry) => {
      const parsed = auditEntryInputSchema.parse(entry);
      return {
        featureKey: parsed.featureKey,
        action: parsed.action,
        targetType: parsed.targetType,
        targetId: parsed.targetId,
        summary: parsed.summary,
        reason: parsed.reason,
        before: redact(parsed.before),
        after: redact(parsed.after),
        actorAccountId: actor.accountId,
        actorName: actor.displayName,
        actorRole: actor.role,
        isSystemAdmin: actor.isSystemAdmin,
        isOutOfScopeOverride: parsed.isOutOfScopeOverride,
        result: parsed.result,
      };
    });
    await this.repository.insert(rows, tx);
  }

  list(query: ListQuery): Promise<AuditPage> {
    return this.repository.list(query);
  }

  get(id: string) {
    return this.repository.get(id);
  }

  facets(): Promise<AuditFacets> {
    return this.repository.facets();
  }
}
