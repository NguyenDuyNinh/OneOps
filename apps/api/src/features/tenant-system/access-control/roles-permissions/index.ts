export { RolesPermissionsModule } from "./roles-permissions.module.js";
export { RolesPermissionsService } from "./roles-permissions.service.js";
export { PermissionGuard } from "./permission.guard.js";
export { SELF_FEATURE } from "./permission-catalog.js";
export {
  PERMISSION_AUDIT,
  type PermissionAuditChange,
  type PermissionAuditPort,
} from "./audit.port.js";
export type {
  Matrix,
  MyPermissions,
  PermissionAction,
  PermissionRole,
} from "./dto/roles-permissions.dto.js";
