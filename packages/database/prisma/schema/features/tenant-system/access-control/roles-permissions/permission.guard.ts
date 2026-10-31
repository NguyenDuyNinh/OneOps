import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  REQUIRE_PERMISSION,
  type ActorRequest,
  type PermissionRequirement,
} from "../../../../core/auth/actor-context.js";
import { RolesPermissionsService } from "./roles-permissions.service.js";

/**
 * Evaluates `@RequirePermission()` after the session guard has attached the actor.
 * Routes without the metadata are untouched, so the matrix can be adopted feature
 * by feature without changing existing behaviour.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly service: RolesPermissionsService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requirement = this.reflector.getAllAndOverride<
      PermissionRequirement | undefined
    >(REQUIRE_PERMISSION, [context.getHandler(), context.getClass()]);
    if (!requirement) return true;
    const request = context.switchToHttp().getRequest<ActorRequest>();
    const actor = request.actor;
    if (!actor)
      throw new UnauthorizedException(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      );
    if (await this.service.can(actor, requirement.feature, requirement.action))
      return true;
    throw new ForbiddenException(
      "Vai trò của bạn không có quyền thực hiện thao tác này.",
    );
  }
}
