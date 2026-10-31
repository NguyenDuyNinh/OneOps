import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  hasAdminPermission,
  type AdminPermission,
  type AccessContext,
} from "../roles.types.js";

export const PERMISSIONS_KEY = "admin_permissions";
export const RequirePermissions = (...permissions: AdminPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      AdminPermission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const accessContext = (request?.accessContext || request?.user) as
      AccessContext | undefined;

    if (!accessContext) {
      return false;
    }

    // Every required permission must be satisfied
    return requiredPermissions.every((permission) =>
      hasAdminPermission(accessContext, permission),
    );
  }
}
