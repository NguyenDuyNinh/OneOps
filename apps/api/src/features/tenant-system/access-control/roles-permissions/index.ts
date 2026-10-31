// Public exports for tenant-system/access-control/roles-permissions

// Core Role & Permission Types (KAN-16)
export {
  SYSTEM_ROLES,
  ADMIN_PERMISSIONS,
  type SystemRole,
  type AdminPermission,
  type AccessContext,
  isSystemRole,
  isAdminPermission,
  hasAdminPermission,
} from "./roles.types.js";

// Management Scope (KAN-18)
export {
  MANAGEMENT_SCOPE_TYPES,
  type ManagementScopeType,
  type ManagementScope,
  type ScopedAccessContext,
  type TeamResource,
  type ProjectResource,
  type EmployeeScopeResource,
  type TaskScopeResource,
  hasDepartmentManagementScope,
  hasTeamManagementScope,
  hasProjectManagementScope,
  hasEmployeeManagementScope,
  hasTaskManagementScope,
  isSuperAdminInterventionOutOfScope,
} from "./access-scope.types.js";

// Resource Relationships (KAN-19)
export {
  TASK_RELATIONSHIPS,
  type TaskRelationship,
  type TaskRelationshipResource,
  getTaskRelationships,
  isTaskAssignee,
  isTaskReviewer,
} from "./resource-relationship.js";

// Task Business Action Policy (KAN-30)
export {
  TASK_STATUSES,
  TASK_ACTIONS,
  type TaskStatus,
  type TaskAction,
  type TaskPolicyResource,
  type TaskActionRequest,
  type TaskActionDecision,
  evaluateTaskAction,
} from "./task-action-policy.js";

// Super Admin Elevation & Out-of-Scope Intervention (KAN-51)
export {
  SUPER_ADMIN_RESOURCE_TYPES,
  type SuperAdminResourceType,
  type SuperAdminInterventionAuditRecord,
  type SuperAdminAccessDecision,
  type SuperAdminAccessRequest,
  isValidSuperAdmin,
  evaluateSuperAdminAccess,
} from "./super-admin.policy.js";

// Manager Revocation Pre-Check (KAN-50)
export {
  type ManagedDepartmentInfo,
  type ManagedTeamInfo,
  type ManagerRevocationCheckRequest,
  type ManagerRevocationCheckDecision,
  canRevokeManagerRole,
} from "./manager-revocation-check.js";

// Role Assignment (KAN-17)
export {
  type TargetUserProfile,
  type RoleAssignmentRequest,
  type RoleAssignmentAuditRecord,
  type RoleAssignmentDecision,
  executeRoleAssignment,
} from "./role-assignment.policy.js";

// Delegated Permissions (KAN-20)
export {
  type DelegatedPermissionsRequest,
  type DelegatedPermissionAuditRecord,
  type DelegatedPermissionsDecision,
  modifyDelegatedPermissions,
} from "./delegated-permissions.policy.js";

// Access Context Sync (KAN-49)
export {
  type RawAccountAuthorizationData,
  type EffectiveAccessContext,
  buildEffectiveAccessContext,
  applyAuthorizationUpdate,
} from "./access-context-sync.js";

// RBAC Audit Logging (KAN-52)
export {
  RBAC_AUDIT_ACTION_TYPES,
  type RbacAuditActionType,
  type RbacAuditEntry,
  sanitizeAuditData,
  createRbacAuditEntry,
  RbacAuditLogSink,
} from "./rbac-audit.logger.js";

// Data Access & Field Visibility (KAN-31)
export {
  type ColleagueAttendanceRecord,
  type SanitizedAttendanceView,
  type LeaveApprovalRequest,
  type LeaveApprovalDecision,
  sanitizeAttendanceView,
  canApproveLeaveRequest,
} from "./data-access.policy.js";

// NestJS Guards & Decorators (KAN-31)
export { ROLES_KEY, RequireRoles, RolesGuard } from "./guards/roles.guard.js";
export {
  PERMISSIONS_KEY,
  RequirePermissions,
  PermissionsGuard,
} from "./guards/permissions.guard.js";
