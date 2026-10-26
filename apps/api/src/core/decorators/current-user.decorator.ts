import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@oneops/shared-types';

/**
 * Lấy JWT payload của user hiện tại từ request.
 * Sử dụng: @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
