import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '../../platform/types/identity.types';
import { getRequiredEnv } from '../auth.config';

/** Giá trị gán vào `request.user` sau khi xác thực JWT. */
export interface RequestUser extends JwtPayload {
  /** Alias của `sub` — một số controller dùng `user.id`. */
  id: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getRequiredEnv('JWT_SECRET'),
    });
  }

  /**
   * Trả về ĐÚNG shape `JwtPayload` (giữ `sub`) + alias `id`.
   * Trước đây chỉ trả `{ id }`, khiến `@CurrentUser().sub` ở các module khác bị undefined.
   */
  async validate(payload: JwtPayload): Promise<RequestUser> {
    return {
      sub: payload.sub,
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
