import {
  Inject,
  Injectable,
  Optional,
  UnprocessableEntityException,
} from "@nestjs/common";
import {
  PERMISSION_ACTIONS,
  type ActorContext,
} from "../../../../core/auth/actor-context.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  assignableActions,
  defaultActions,
  normalizeActions,
  permissionCatalog,
} from "./permission-catalog.js";
import { RolesPermissionsRepository } from "./roles-permissions.repository.js";
import {
  PERMISSION_AUDIT,
  type PermissionAuditChange,
  type PermissionAuditPort,
} from "./audit.port.js";
import {
  matrixSchema,
  myPermissionsSchema,
  permissionRowSchema,
  saveMatrixSchema,
  type Matrix,
  type MyPermissions,
  type PermissionAction,
  type PermissionRole,
  type SaveMatrix,
} from "./dto/roles-permissions.dto.js";

const ROLES: readonly PermissionRole[] = ["EMPLOYEE", "MANAGER"];

/**
 * Owns the runtime permission matrix: defaults, stored overrides, effective
 * actions for an actor, and the guard query used by `RequirePermission` routes.
 */
@Injectable()
export class RolesPermissionsService {
  constructor(
    private readonly repository: RolesPermissionsRepository,
    @Optional()
    @Inject(PERMISSION_AUDIT)
    private readonly audit?: PermissionAuditPort,
  ) {}

  /** Full matrix: one row per feature and role, in catalog order. */
  async matrix(): Promise<Matrix> {
    const stored = await this.repository.stored();
    const index = new Map(
      stored.map((row) => [`${row.featureKey}|${row.role}`, row]),
    );
    const items = permissionCatalog.flatMap((entry) =>
      ROLES.map((role) => {
        const row = index.get(`${entry.key}|${role}`);
        return permissionRowSchema.parse({
          featureKey: entry.key,
          group: entry.group,
          label: entry.label,
          role,
          actions: row
            ? normalizeActions(row.actions)
            : defaultActions(entry.key, role),
          version: row?.version ?? 0,
          isDefault: !row,
        });
      }),
    );
    return matrixSchema.parse({
      items,
      actions: [...PERMISSION_ACTIONS],
      roles: [...ROLES],
    });
  }

  /** Effective permissions of the signed-in actor; system administrators hold every action. */
  async mine(actor: ActorContext): Promise<MyPermissions> {
    const stored = await this.repository.stored();
    const index = new Map(
      stored.map((row) => [`${row.featureKey}|${row.role}`, row]),
    );
    const items = permissionCatalog.map((entry) => ({
      featureKey: entry.key,
      actions: actor.isSystemAdmin
        ? [...PERMISSION_ACTIONS]
        : (index.get(`${entry.key}|${actor.role}`)?.actions ??
          defaultActions(entry.key, actor.role)),
    }));
    return myPermissionsSchema.parse({
      role: actor.role,
      isSystemAdmin: actor.isSystemAdmin,
      canManage: actor.isSystemAdmin,
      items: items.map((item) => ({
        featureKey: item.featureKey,
        actions: actor.isSystemAdmin
          ? [...PERMISSION_ACTIONS]
          : normalizeActions(item.actions),
      })),
    });
  }

  /**
   * Guard query. `manage` is never stored, so it only passes through the system
   * administrator branch above the matrix.
   */
  async can(
    actor: ActorContext,
    feature: string,
    action: string,
  ): Promise<boolean> {
    if (actor.isSystemAdmin) return true;
    if (!assignableActions.includes(action as PermissionAction)) return false;
    const cell = await this.repository.cell(feature, actor.role);
    const actions = cell
      ? normalizeActions(cell.actions)
      : defaultActions(feature, actor.role);
    return actions.includes(action as PermissionAction);
  }

  /** Applies changed cells in one transaction and records one history row per change. */
  async save(input: SaveMatrix, actor: ActorContext) {
    const parsed = new SchemaPipe(saveMatrixSchema).transform(input);
    const keys = new Set<string>();
    for (const row of parsed.items) {
      const key = `${row.featureKey}|${row.role}`;
      if (keys.has(key))
        throw new UnprocessableEntityException(
          "Ma trận có dòng quyền bị lặp. Vui lòng tải lại trước khi lưu.",
        );
      keys.add(key);
      if (row.actions.includes("manage"))
        throw new UnprocessableEntityException(
          "Quyền quản lý ma trận chỉ thuộc quản trị hệ thống.",
        );
    }
    const stored = await this.repository.stored();
    const index = new Map(
      stored.map((row) => [`${row.featureKey}|${row.role}`, row]),
    );
    const reason = parsed.reason || "Cập nhật ma trận quyền";
    const changes: PermissionAuditChange[] = [];
    await this.repository.transaction(async (tx) => {
      for (const item of parsed.items) {
        const current = index.get(`${item.featureKey}|${item.role}`);
        const before = current
          ? normalizeActions(current.actions)
          : defaultActions(item.featureKey, item.role as PermissionRole);
        const after = normalizeActions(item.actions);
        if (
          before.length === after.length &&
          before.every((action, i) => action === after[i])
        )
          continue;
        const saved = await this.repository.save(
          {
            featureKey: item.featureKey,
            role: item.role,
            actions: after,
            version: item.version,
          },
          actor.displayName,
          tx,
        );
        await this.repository.recordChange(
          {
            featureKey: saved.featureKey,
            role: saved.role,
            fromActions: before,
            toActions: after,
            actorName: actor.displayName,
            reason,
          },
          tx,
        );
        changes.push({
          featureKey: saved.featureKey,
          role: saved.role,
          fromActions: before,
          toActions: after,
          reason,
        });
      }
      // The audit entry commits with the change, so a saved cell can never be
      // missing from the system log.
      await this.audit?.record(changes, actor, tx);
    });
    return this.matrix();
  }

  history() {
    return this.repository.history();
  }
}
