
/**
 * KAN-16: System Roles
 * OneOps - Roles & Permissions
 */

export const SYSTEM_ROLES = {
  EMPLOYEE: "EMPLOYEE",
  MANAGER: "MANAGER",
} as const;

export type SystemRole =
  (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

/**
 * Quyền quản trị được cấp bổ sung.
 * Không phải role thứ ba.
 */
export const ADMIN_PERMISSIONS = {
  MANAGE_ACCOUNTS: "MANAGE_ACCOUNTS",
  MANAGE_ROLES: "MANAGE_ROLES",
  MANAGE_SYSTEM_CONFIG: "MANAGE_SYSTEM_CONFIG",
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

/**
 * Thông tin phân quyền của người dùng.
 */
export interface AccessContext {
  userId: string;
  role: SystemRole;
  isSuperAdmin: boolean;
  adminPermissions: readonly AdminPermission[];
}

/**
 * Kiểm tra role hợp lệ.
 */
export function isSystemRole(
  value: unknown,
): value is SystemRole {
  return Object.values(SYSTEM_ROLES).some(
    (role) => role === value,
  );
}

/**
 * Kiểm tra quyền quản trị được cấp.
 * Quyền này không thay thế kiểm tra phạm vi dữ liệu.
 */
export function hasAdminPermission(
  context: AccessContext,
  permission: AdminPermission,
): boolean {
  if (context.role !== SYSTEM_ROLES.MANAGER) {
    return false;
  }

  if (context.isSuperAdmin) {
    return true;
  }

  return context.adminPermissions.includes(permission);
}
