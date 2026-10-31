import { SYSTEM_ROLES, type AccessContext } from "./roles.types.js";

/**
 * KAN-18: Management Scope
 *
 * Scope controls where a manager is authorized to manage
 * resources (Departments, Teams, Projects, Employees, Tasks).
 * It does not replace action-specific permissions or business conditions.
 *
 * BR-ORG-01, BR-ORG-03, BR-ORG-04, BR-ORG-07, BR-ORG-15, BR-ORG-16, BR-ORG-19
 * BR-PER-04, BR-PER-11
 * BR-PRJ-01, BR-PRJ-02
 */

export const MANAGEMENT_SCOPE_TYPES = {
  DEPARTMENT: "DEPARTMENT",
  TEAM: "TEAM",
  PROJECT: "PROJECT",
} as const;

export type ManagementScopeType =
  (typeof MANAGEMENT_SCOPE_TYPES)[keyof typeof MANAGEMENT_SCOPE_TYPES];

export interface ManagementScope {
  departmentIds: readonly string[];
  teamIds: readonly string[];
  projectIds?: readonly string[];
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

/**
 * A project belongs to exactly one department (BR-ORG-01).
 */
export interface ProjectResource {
  id: string;
  departmentId: string;
}

/**
 * An employee belongs to exactly one team (BR-ORG-15).
 * Direct managers of the employee are managers of that team (BR-ORG-16).
 */
export interface EmployeeScopeResource {
  id: string;
  teamId: string;
  departmentId: string;
}

/**
 * A task belongs to either a team or a project,
 * both of which belong to a department.
 */
export interface TaskScopeResource {
  id: string;
  departmentId: string;
  teamId?: string | null;
  projectId?: string | null;
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

  return context.managementScope.departmentIds.includes(departmentId);
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

  const managesTeamDirectly = context.managementScope.teamIds.includes(team.id);

  const managesParentDepartment =
    context.managementScope.departmentIds.includes(team.departmentId);

  return managesTeamDirectly || managesParentDepartment;
}

export function hasProjectManagementScope(
  context: ScopedAccessContext,
  project: ProjectResource,
): boolean {
  if (context.role !== SYSTEM_ROLES.MANAGER) {
    return false;
  }

  if (!project.id.trim() || !project.departmentId.trim()) {
    return false;
  }

  if (context.isSuperAdmin) {
    return true;
  }

  const managesProjectDirectly =
    context.managementScope.projectIds?.includes(project.id) ?? false;

  const managesParentDepartment =
    context.managementScope.departmentIds.includes(project.departmentId);

  return managesProjectDirectly || managesParentDepartment;
}

export function hasEmployeeManagementScope(
  context: ScopedAccessContext,
  employee: EmployeeScopeResource,
): boolean {
  if (context.role !== SYSTEM_ROLES.MANAGER) {
    return false;
  }

  if (
    !employee.id.trim() ||
    !employee.teamId.trim() ||
    !employee.departmentId.trim()
  ) {
    return false;
  }

  if (context.isSuperAdmin) {
    return true;
  }

  return hasTeamManagementScope(context, {
    id: employee.teamId,
    departmentId: employee.departmentId,
  });
}

export function hasTaskManagementScope(
  context: ScopedAccessContext,
  task: TaskScopeResource,
): boolean {
  if (context.role !== SYSTEM_ROLES.MANAGER) {
    return false;
  }

  if (!task.id.trim() || !task.departmentId.trim()) {
    return false;
  }

  const hasTeam = Boolean(task.teamId && task.teamId.trim());
  const hasProject = Boolean(task.projectId && task.projectId.trim());

  if (!hasTeam && !hasProject) {
    return false;
  }

  if (context.isSuperAdmin) {
    return true;
  }

  if (context.managementScope.departmentIds.includes(task.departmentId)) {
    return true;
  }

  if (
    hasTeam &&
    task.teamId &&
    context.managementScope.teamIds.includes(task.teamId)
  ) {
    return true;
  }

  if (
    hasProject &&
    task.projectId &&
    (context.managementScope.projectIds?.includes(task.projectId) ?? false)
  ) {
    return true;
  }

  return false;
}

/**
 * BR-PER-11 & KAN-51:
 * Determines if a Super Admin is operating outside their assigned management scope.
 * Actions outside assigned scope are permitted for Super Admin but must be recorded in audit logs.
 */
export function isSuperAdminInterventionOutOfScope(
  context: ScopedAccessContext,
  hasDirectScopeFn: () => boolean,
): boolean {
  if (!context.isSuperAdmin || context.role !== SYSTEM_ROLES.MANAGER) {
    return false;
  }

  return !hasDirectScopeFn();
}
