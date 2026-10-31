import { Injectable } from "@nestjs/common";
import type { ActorContext } from "../../core/auth/actor-context.js";
import type { Transaction } from "../../core/database/database.module.js";
import type {
  PermissionAuditChange,
  PermissionAuditPort,
} from "./access-control/roles-permissions/index.js";
import { ChecklogService } from "./checklog/index.js";

/**
 * Composition adapter: the matrix feature records administration changes
 * through its own port, and this class maps them onto the central audit sink.
 * Each entry keeps the feature whose permissions changed, so the log answers
 * "what happened to this feature" as well as "who changed permissions".
 */
@Injectable()
export class PermissionAudit implements PermissionAuditPort {
  constructor(private readonly checklog: ChecklogService) {}

  async record(
    changes: readonly PermissionAuditChange[],
    actor: ActorContext,
    tx?: Transaction,
  ): Promise<void> {
    await this.checklog.record(
      changes.map((change) => ({
        featureKey: change.featureKey,
        action: "PERMISSION_CHANGE",
        targetType: "RolePermission",
        targetId: change.role,
        summary: `Cập nhật quyền ${change.role} cho ${change.featureKey}`,
        reason: change.reason,
        before: { actions: [...change.fromActions] },
        after: { actions: [...change.toActions] },
      })),
      actor,
      tx,
    );
  }
}
