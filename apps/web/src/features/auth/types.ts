/**
 * Contract của feature `auth` — **dùng chung cho mọi bề mặt** (đăng nhập của
 * admin và của nhân viên là cùng một cơ chế).
 *
 * Feature `auth` là feature chia sẻ duy nhất của FE: nó sở hữu phiên đăng nhập
 * (`lib/auth-storage.ts`) và HTTP client biết gắn token (`lib/api-client.ts`),
 * nên `features/admin/*` lẫn `features/employee/*` đều import từ đây.
 *
 * Shape khớp `apps/api/src/modules/auth/auth.types.ts` + `users.types.ts`.
 */

/** Vai trò người dùng — khớp enum `UserRole` của Prisma và contract phía API. */
export enum UserRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

/** Thông tin user trả về sau khi đăng nhập (khớp `AuthenticatedUser` phía API). */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

/** Payload gửi lên `POST /auth/login`. */
export interface LoginDto {
  email: string;
  password: string;
}

/** Response của `POST /auth/login` — khớp `LoginResponse` phía API. */
export interface LoginResponse {
  accessToken: string;
  user: AuthenticatedUser;
}
