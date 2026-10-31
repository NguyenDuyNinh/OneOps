import type { ActorContext } from "../../../../core/auth/actor-context.js";
import type { Transaction } from "../../../../core/database/database.module.js";

export const PERMISSION_AUDIT = "oneops:permission-audit";

export interface PermissionAuditChange {
  featureKey: string;
  role: string;
  fromActions: readonly string[];
  toActions: readonly string[];
  reason: string;
}

/**
 * Audit sink port. The composition binds it to `tenant-system/checklog`, so
 * this feature records administration changes without importing that feature.
 */
export interface PermissionAuditPort {
  record(
    changes: readonly PermissionAuditChange[],
    actor: ActorContext,
    tx?: Transaction,
  ): Promise<void>;
}
