import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  SYSTEM_ROLES,
  type SystemRole,
  type AccessContext,
} from "../roles.types.js";

export const ROLES_KEY = "system_roles";
export const RequireRoles = (...roles: SystemRole[]) =>
  SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const accessContext = (request?.accessContext || request?.user) as
      AccessContext | undefined;

    if (!accessContext || !accessContext.role) {
      return false;
    }

    // Super Admin must still possess the MANAGER role
    if (
      accessContext.isSuperAdmin &&
      accessContext.role === SYSTEM_ROLES.MANAGER &&
      requiredRoles.includes(SYSTEM_ROLES.MANAGER)
    ) {
      return true;
    }

    return requiredRoles.includes(accessContext.role);
  }
}
