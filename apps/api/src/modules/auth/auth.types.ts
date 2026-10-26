// [AUTH] — Hợp đồng dữ liệu của module Xác thực (chỉ đăng nhập).
// Payload request dùng class DTO (`dto/login.dto.ts`); file này giữ shape response.

import type { UserRole } from '../platform/types/identity.types';

/** Thông tin user trả về sau khi đăng nhập (không bao giờ chứa passwordHash). */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

/** Response của `POST /auth/login`. */
export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}
