import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  ADMIN_ONLY,
  PUBLIC_ROUTE,
  type ActorRequest,
} from "../../../../core/auth/actor-context.js";
import { sessionToken } from "./session-cookie.js";
import { TenantAuthService } from "./tenant-auth.service.js";

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly service: TenantAuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const [open, adminOnly] = [
      this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [
        context.getHandler(),
        context.getClass(),
      ]),
      this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY, [
        context.getHandler(),
        context.getClass(),
      ]),
    ];
    const request = context.switchToHttp().getRequest<ActorRequest>();
    const token = sessionToken(request.headers.cookie);
    if (token) {
      const actor = await this.service.resolve(token);
      if (actor) {
        request.actor = actor;
        if (adminOnly && !actor.isSystemAdmin)
          throw new ForbiddenException(
            "Chỉ quản trị hệ thống mới thực hiện được thao tác này.",
          );
        return true;
      }
    }
    if (open) return true;
    throw new UnauthorizedException(
      "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    );
  }
}
