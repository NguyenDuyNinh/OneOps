import {
  ADMIN_PERMISSIONS,
  hasAdminPermission,
  type AccessContext,
} from "./roles.types.js";

/**
 * KAN-50: Validation before revoking MANAGER role
 *
 * BR-ORG-03: Each Department must have at least 1 administrator; each Team must
 * have at least 1 manager. The system forbids removing the last manager.
 * BR-ORG-18: Department administrators and Team managers must have role MANAGER.
 * Revoking role MANAGER requires replacing them first if they are the sole manager.
 * BR-PER-03: Only Super Admin or a Manager explicitly granted MANAGE_ROLES
 * permission may revoke the MANAGER role.
 * AC-ORG-08: Revoking the last manager blocks and requires selecting a replacement.
 */

export interface ManagedDepartmentInfo {
  id: string;
  name: string;
  managerIds: readonly string[];
}

export interface ManagedTeamInfo {
  id: string;
  name: string;
  departmentId: string;
  managerIds: readonly string[];
}

export interface ManagerRevocationCheckRequest {
  actorContext: AccessContext;
  targetUserId: string;
  activeDepartments: readonly ManagedDepartmentInfo[];
  activeTeams: readonly ManagedTeamInfo[];
}

export type ManagerRevocationCheckDecision =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: string;
      blockingDepartments?: Array<{ id: string; name: string }>;
      blockingTeams?: Array<{ id: string; name: string }>;
    };

export function canRevokeManagerRole(
  request: ManagerRevocationCheckRequest,
): ManagerRevocationCheckDecision {
  const { actorContext, targetUserId, activeDepartments, activeTeams } =
    request;

  if (!actorContext || !actorContext.userId?.trim()) {
    return {
      allowed: false,
      reason: "Missing or invalid actor context",
    };
  }

  if (!targetUserId?.trim()) {
    return {
      allowed: false,
      reason: "Target user ID must not be empty",
    };
  }

  // 1. Actor permission check (BR-PER-03)
  const isAuthorized = hasAdminPermission(
    actorContext,
    ADMIN_PERMISSIONS.MANAGE_ROLES,
  );
  if (!isAuthorized) {
    return {
      allowed: false,
      reason: "Actor does not have MANAGE_ROLES permission to revoke roles",
    };
  }

  // 2. Prevent self-lockout
  if (actorContext.userId === targetUserId) {
    return {
      allowed: false,
      reason: "Users cannot revoke their own manager role",
    };
  }

  // 3. BR-ORG-03 & BR-ORG-18: Check sole department management
  const blockingDepartments: Array<{ id: string; name: string }> = [];
  for (const dept of activeDepartments) {
    const isManaging = dept.managerIds.includes(targetUserId);
    const isSoleManager = dept.managerIds.length <= 1;
    if (isManaging && isSoleManager) {
      blockingDepartments.push({ id: dept.id, name: dept.name });
    }
  }

  // 4. BR-ORG-03 & BR-ORG-18: Check sole team management
  const blockingTeams: Array<{ id: string; name: string }> = [];
  for (const team of activeTeams) {
    const isManaging = team.managerIds.includes(targetUserId);
    const isSoleManager = team.managerIds.length <= 1;
    if (isManaging && isSoleManager) {
      blockingTeams.push({ id: team.id, name: team.name });
    }
  }

  if (blockingDepartments.length > 0 || blockingTeams.length > 0) {
    return {
      allowed: false,
      reason:
        "Cannot revoke manager role: user is the sole manager of one or more active departments or teams (BR-ORG-03, BR-ORG-18)",
      blockingDepartments:
        blockingDepartments.length > 0 ? blockingDepartments : undefined,
      blockingTeams: blockingTeams.length > 0 ? blockingTeams : undefined,
    };
  }

  return {
    allowed: true,
  };
}
