// [SHARED] — Module Xác thực (Auth)
// Hợp đồng dữ liệu dùng chung giữa API và Web cho luồng đăng nhập.

import type { UserRole } from './user.types';

/** Payload gửi lên `POST /auth/login`. */
export interface LoginDto {
  email: string;
  password: string;
}

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
