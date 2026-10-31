import {
  SYSTEM_ROLES,
  ADMIN_PERMISSIONS,
  hasAdminPermission,
  type SystemRole,
  type AdminPermission,
  type AccessContext,
} from "./roles.types.js";
import {
  canRevokeManagerRole,
  type ManagedDepartmentInfo,
  type ManagedTeamInfo,
} from "./manager-revocation-check.js";

/**
 * KAN-17: Grant and Revoke System Role (EMPLOYEE <-> MANAGER)
 *
 * BR-PER-01: Exactly two system roles: EMPLOYEE and MANAGER.
 * BR-PER-03: Only Super Admin or a Manager with MANAGE_ROLES permission
 * can grant or revoke the MANAGER role.
 * BR-ACC-04: Granting MANAGER role does not automatically grant admin permissions.
 * BR-ORG-18 & BR-ORG-03: Revoking MANAGER role requires validation via KAN-50
 * to ensure active departments and teams are not left without a manager.
 */

export interface TargetUserProfile {
  id: string;
  role: SystemRole;
  adminPermissions: readonly AdminPermission[];
}

export interface RoleAssignmentRequest {
  actorContext: AccessContext;
  targetUser: TargetUserProfile;
  newRole: SystemRole;
  activeDepartments?: readonly ManagedDepartmentInfo[];
  activeTeams?: readonly ManagedTeamInfo[];
}

export interface RoleAssignmentAuditRecord {
  actorId: string;
  targetUserId: string;
  action: "GRANT_MANAGER" | "REVOKE_MANAGER";
  previousRole: SystemRole;
  newRole: SystemRole;
  timestamp: string;
}

export type RoleAssignmentDecision =
  | {
      allowed: true;
      updatedRole: SystemRole;
      updatedAdminPermissions: readonly AdminPermission[];
      auditRecord: RoleAssignmentAuditRecord;
    }
  | {
      allowed: false;
      reason: string;
    };

export function executeRoleAssignment(
  request: RoleAssignmentRequest,
): RoleAssignmentDecision {
  const {
    actorContext,
    targetUser,
    newRole,
    activeDepartments = [],
    activeTeams = [],
  } = request;

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

  // Check valid role
  if (newRole !== SYSTEM_ROLES.EMPLOYEE && newRole !== SYSTEM_ROLES.MANAGER) {
    return {
      allowed: false,
      reason: "Invalid system role specified",
    };
  }

  // No-op if target user already has requested role
  if (targetUser.role === newRole) {
    return {
      allowed: false,
      reason: `Target user already holds role ${newRole}`,
    };
  }

  // BR-PER-03: Actor permission check
  const isAuthorized = hasAdminPermission(
    actorContext,
    ADMIN_PERMISSIONS.MANAGE_ROLES,
  );
  if (!isAuthorized) {
    return {
      allowed: false,
      reason: "Actor does not have MANAGE_ROLES permission to modify roles",
    };
  }

  // Revocation flow: MANAGER -> EMPLOYEE
  if (newRole === SYSTEM_ROLES.EMPLOYEE) {
    // Perform safety check using KAN-50
    const safetyCheck = canRevokeManagerRole({
      actorContext,
      targetUserId: targetUser.id,
      activeDepartments,
      activeTeams,
    });

    if (!safetyCheck.allowed) {
      return {
        allowed: false,
        reason: safetyCheck.reason,
      };
    }

    return {
      allowed: true,
      updatedRole: SYSTEM_ROLES.EMPLOYEE,
      // Revoking manager role automatically strips admin permissions
      updatedAdminPermissions: [],
      auditRecord: {
        actorId: actorContext.userId,
        targetUserId: targetUser.id,
        action: "REVOKE_MANAGER",
        previousRole: targetUser.role,
        newRole: SYSTEM_ROLES.EMPLOYEE,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Grant flow: EMPLOYEE -> MANAGER (BR-ACC-04: no automatic admin rights)
  return {
    allowed: true,
    updatedRole: SYSTEM_ROLES.MANAGER,
    updatedAdminPermissions: [],
    auditRecord: {
      actorId: actorContext.userId,
      targetUserId: targetUser.id,
      action: "GRANT_MANAGER",
      previousRole: targetUser.role,
      newRole: SYSTEM_ROLES.MANAGER,
      timestamp: new Date().toISOString(),
    },
  };
}
