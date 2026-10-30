
import {
  SYSTEM_ROLES,
  type AccessContext,
} from "./roles.types.js";

/**
 * KAN-18: Management Scope
 *
 * Scope controls where a manager is authorized to manage
 * resources. It does not replace action-specific permissions
 * or business conditions.
 */

export const MANAGEMENT_SCOPE_TYPES = {
  DEPARTMENT: "DEPARTMENT",
  TEAM: "TEAM",
} as const;

export type ManagementScopeType =
  (typeof MANAGEMENT_SCOPE_TYPES)[keyof typeof MANAGEMENT_SCOPE_TYPES];

export interface ManagementScope {
  departmentIds: readonly string[];
  teamIds: readonly string[];
}

export interface ScopedAccessContext extends AccessContext {
  managementScope: ManagementScope;
}

/**
 * The department to which a team belongs must be
 * resolved from trusted server-side data.
 */
export interface TeamResource {
  id: string;
  departmentId: string;
}

export function hasDepartmentManagementScope(
  context: ScopedAccessContext,
  departmentId: string,
): boolean {
  if (context.role !== SYSTEM_ROLES.MANAGER) {
    return false;
  }

  if (!departmentId.trim()) {
    return false;
  }

  if (context.isSuperAdmin) {
    return true;
  }

  return context.managementScope.departmentIds.includes(
    departmentId,
  );
}

export function hasTeamManagementScope(
  context: ScopedAccessContext,
  team: TeamResource,
): boolean {
  if (context.role !== SYSTEM_ROLES.MANAGER) {
    return false;
  }

  if (!team.id.trim() || !team.departmentId.trim()) {
    return false;
  }

  if (context.isSuperAdmin) {
    return true;
  }

  const managesTeamDirectly =
    context.managementScope.teamIds.includes(team.id);

  const managesParentDepartment =
    context.managementScope.departmentIds.includes(
      team.departmentId,
    );

  return managesTeamDirectly || managesParentDepartment;
}
