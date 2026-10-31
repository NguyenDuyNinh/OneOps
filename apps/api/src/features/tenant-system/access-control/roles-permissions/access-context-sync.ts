import {
  SYSTEM_ROLES,
  ADMIN_PERMISSIONS,
  type SystemRole,
  type AdminPermission,
} from "./roles.types.js";
import type {
  ScopedAccessContext,
  ManagementScope,
} from "./access-scope.types.js";

/**
 * KAN-49: Apply Permission Changes & Dynamic Access Context Synchronization
 *
 * OneOps System Alignment:
 * When an employee changes positions or roles, Admin updates their role and
 * all effective rights are synchronized immediately across the system.
 *
 * BR-PER-01: Exactly two system roles: EMPLOYEE and MANAGER.
 * BR-ACC-05 & BR-PER-08: Locked accounts cannot access the system.
 * BR-ACC-04: Manager role does not automatically receive admin rights.
 * BR-PER-08: Account lock preserves profile and history, but revokes active access.
 */

export interface RawAccountAuthorizationData {
  userId: string;
  role: SystemRole;
  isSuperAdmin?: boolean;
  isLocked?: boolean;
  adminPermissions?: readonly AdminPermission[];
  departmentIds?: readonly string[];
  teamIds?: readonly string[];
  projectIds?: readonly string[];
}

export interface EffectiveAccessContext extends ScopedAccessContext {
  isActive: boolean;
  isLocked: boolean;
}

/**
 * Builds the trusted, active AccessContext from database state.
 * Enforces security invariants:
 * 1. Locked accounts have zero active permissions and cannot perform operations.
 * 2. EMPLOYEE accounts never hold admin permissions or super admin flags.
 * 3. Normal MANAGER accounts only hold explicitly granted permissions.
 */
export function buildEffectiveAccessContext(
  data: RawAccountAuthorizationData,
): EffectiveAccessContext {
  const isLocked = Boolean(data.isLocked);
  const userId = data.userId?.trim() || "";

  // 1. Locked account invariant: all access stripped
  if (isLocked || !userId) {
    return {
      userId,
      role: SYSTEM_ROLES.EMPLOYEE,
      isSuperAdmin: false,
      isActive: false,
      isLocked: true,
      adminPermissions: [],
      managementScope: {
        departmentIds: [],
        teamIds: [],
        projectIds: [],
      },
    };
  }

  const role =
    data.role === SYSTEM_ROLES.MANAGER
      ? SYSTEM_ROLES.MANAGER
      : SYSTEM_ROLES.EMPLOYEE;

  // 2. Employee invariant: zero admin rights
  if (role === SYSTEM_ROLES.EMPLOYEE) {
    return {
      userId,
      role: SYSTEM_ROLES.EMPLOYEE,
      isSuperAdmin: false,
      isActive: true,
      isLocked: false,
      adminPermissions: [],
      managementScope: {
        departmentIds: [],
        teamIds: [],
        projectIds: [],
      },
    };
  }

  // 3. Manager role handling
  const isSuperAdmin = Boolean(data.isSuperAdmin);

  const rawPermissions = data.adminPermissions || [];
  const validPermissions = Object.values(ADMIN_PERMISSIONS);
  const adminPermissions = isSuperAdmin
    ? validPermissions
    : rawPermissions.filter((p) => validPermissions.includes(p));

  const managementScope: ManagementScope = {
    departmentIds: data.departmentIds ? [...data.departmentIds] : [],
    teamIds: data.teamIds ? [...data.teamIds] : [],
    projectIds: data.projectIds ? [...data.projectIds] : [],
  };

  return {
    userId,
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin,
    isActive: true,
    isLocked: false,
    adminPermissions,
    managementScope,
  };
}

/**
 * Re-synchronizes effective context when an update (role, lock status, scope) is applied.
 */
export function applyAuthorizationUpdate(
  current: EffectiveAccessContext,
  update: Partial<RawAccountAuthorizationData>,
): EffectiveAccessContext {
  const merged: RawAccountAuthorizationData = {
    userId: update.userId ?? current.userId,
    role: update.role ?? current.role,
    isSuperAdmin: update.isSuperAdmin ?? current.isSuperAdmin,
    isLocked: update.isLocked ?? current.isLocked,
    adminPermissions: update.adminPermissions ?? current.adminPermissions,
    departmentIds:
      update.departmentIds ?? current.managementScope.departmentIds,
    teamIds: update.teamIds ?? current.managementScope.teamIds,
    projectIds: update.projectIds ?? current.managementScope.projectIds,
  };

  return buildEffectiveAccessContext(merged);
}
