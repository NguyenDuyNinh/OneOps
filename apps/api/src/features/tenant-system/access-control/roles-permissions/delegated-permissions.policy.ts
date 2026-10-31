import {
  SYSTEM_ROLES,
  ADMIN_PERMISSIONS,
  isAdminPermission,
  hasAdminPermission,
  type AdminPermission,
  type AccessContext,
} from "./roles.types.js";
import type { TargetUserProfile } from "./role-assignment.policy.js";

/**
 * KAN-20: Delegated Admin Permission Management
 *
 * BR-PER-01: System roles are EMPLOYEE and MANAGER. Chức danh không cấp quyền.
 * BR-PER-03: Only Super Admin or a Manager with MANAGE_ROLES permission can
 * grant or revoke delegated administrative permissions.
 * BR-ACC-04: Manager role does not automatically have admin permissions.
 * Admin permissions can only be held by accounts with role MANAGER.
 * BR-PER-10: Every permission change must generate an audit record.
 */

export interface DelegatedPermissionsRequest {
  actorContext: AccessContext;
  targetUser: TargetUserProfile;
  permissions: readonly AdminPermission[];
}

export interface DelegatedPermissionAuditRecord {
  actorId: string;
  targetUserId: string;
  action: "GRANT_PERMISSIONS" | "REVOKE_PERMISSIONS" | "SYNC_PERMISSIONS";
  previousPermissions: readonly AdminPermission[];
  newPermissions: readonly AdminPermission[];
  timestamp: string;
}

export type DelegatedPermissionsDecision =
  | {
      allowed: true;
      updatedPermissions: readonly AdminPermission[];
      auditRecord: DelegatedPermissionAuditRecord;
    }
  | {
      allowed: false;
      reason: string;
    };

export function modifyDelegatedPermissions(
  request: DelegatedPermissionsRequest,
  mode: "GRANT" | "REVOKE" | "SYNC",
): DelegatedPermissionsDecision {
  const { actorContext, targetUser, permissions } = request;

  if (!actorContext || !actorContext.userId?.trim()) {
    return {
      allowed: false,
      reason: "Missing or invalid actor context",
    };
  }

  if (!targetUser || !targetUser.id?.trim()) {
    return {
      allowed: false,
      reason: "Missing or invalid target user profile",
    };
  }

  // 1. Target must be a MANAGER (BR-ACC-04, BR-PER-01: Employees cannot hold admin permissions)
  if (targetUser.role !== SYSTEM_ROLES.MANAGER) {
    return {
      allowed: false,
      reason:
        "Administrative permissions can only be granted to accounts with role MANAGER",
    };
  }

  // 2. Actor must have MANAGE_ROLES permission (BR-PER-03)
  const isAuthorized = hasAdminPermission(
    actorContext,
    ADMIN_PERMISSIONS.MANAGE_ROLES,
  );
  if (!isAuthorized) {
    return {
      allowed: false,
      reason: "Actor does not have MANAGE_ROLES permission",
    };
  }

  // 3. Validate permissions being modified
  for (const perm of permissions) {
    if (!isAdminPermission(perm)) {
      return {
        allowed: false,
        reason: `Invalid administrative permission: ${String(perm)}`,
      };
    }
  }

  // 4. Calculate updated permission set
  const currentSet = new Set(targetUser.adminPermissions);
  let action: DelegatedPermissionAuditRecord["action"];

  if (mode === "GRANT") {
    action = "GRANT_PERMISSIONS";
    for (const perm of permissions) {
      currentSet.add(perm);
    }
  } else if (mode === "REVOKE") {
    action = "REVOKE_PERMISSIONS";
    for (const perm of permissions) {
      currentSet.delete(perm);
    }
  } else {
    action = "SYNC_PERMISSIONS";
    currentSet.clear();
    for (const perm of permissions) {
      currentSet.add(perm);
    }
  }

  const updatedPermissions = Array.from(currentSet) as AdminPermission[];

  return {
    allowed: true,
    updatedPermissions,
    auditRecord: {
      actorId: actorContext.userId,
      targetUserId: targetUser.id,
      action,
      previousPermissions: targetUser.adminPermissions,
      newPermissions: updatedPermissions,
      timestamp: new Date().toISOString(),
    },
  };
}
