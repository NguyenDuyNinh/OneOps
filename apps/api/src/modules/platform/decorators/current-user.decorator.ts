import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../types/identity.types';

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
