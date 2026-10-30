
/**
 * OneOps - KAN-16: Define System Roles
 *
 * BR-PER-01: Only EMPLOYEE and MANAGER are system roles.
 * BR-PER-02: Job titles are not authorization roles.
 * BR-ACC-04: MANAGER does not automatically have admin rights.
 */

export const SYSTEM_ROLES = {
  EMPLOYEE: "EMPLOYEE",
  MANAGER: "MANAGER",
} as const;

export type SystemRole =
  (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

/**
 * Initial administrative permissions.
 *
 * This is a preliminary set for RBAC development.
 * The full permission catalog belongs to later tasks.
 */
export const ADMIN_PERMISSIONS = {
  MANAGE_ACCOUNTS: "MANAGE_ACCOUNTS",
  MANAGE_ROLES: "MANAGE_ROLES",
  MANAGE_SYSTEM_CONFIG: "MANAGE_SYSTEM_CONFIG",
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

/**
 * Authorization data created by trusted backend code.
 *
 * Do not construct this object directly from client input.
 * Resource scopes and assignment checks are handled separately.
 */
export interface AccessContext {
  userId: string;
  role: SystemRole;
  isSuperAdmin: boolean;
  adminPermissions: readonly AdminPermission[];
}

/**
 * Accept only the two canonical system roles.
 */
export function isSystemRole(
  value: unknown,
): value is SystemRole {
  return (
    value === SYSTEM_ROLES.EMPLOYEE ||
    value === SYSTEM_ROLES.MANAGER
  );
}

/**
 * Accept only defined administrative permissions.
 */
export function isAdminPermission(
  value: unknown,
): value is AdminPermission {
  return (
    value === ADMIN_PERMISSIONS.MANAGE_ACCOUNTS ||
    value === ADMIN_PERMISSIONS.MANAGE_ROLES ||
    value === ADMIN_PERMISSIONS.MANAGE_SYSTEM_CONFIG
  );
}

/**
 * Check whether a trusted context has an admin permission.
 *
 * A normal MANAGER needs the permission explicitly granted.
 * A Super Admin must still have the MANAGER role.
 *
 * This helper does not validate authentication, account status,
 * management scope, or the state of a business resource.
 */
export function hasAdminPermission(
  context: AccessContext,
  permission: AdminPermission,
): boolean {
  if (context.role !== SYSTEM_ROLES.MANAGER) {
    return false;
  }

  if (!isAdminPermission(permission)) {
    return false;
  }

  if (context.isSuperAdmin) {
    return true;
  }

  return context.adminPermissions.includes(permission);
}
