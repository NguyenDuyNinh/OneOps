/**
 * [SHARED] — Định danh người dùng, dùng chung toàn backend.
 *
 * Vì sao nằm ở `modules/platform` chứ không phải trong module nghiệp vụ?
 * `UserRole` và `JwtPayload` được chính hạ tầng HTTP (`@Roles`, `@CurrentUser`,
 * `RolesGuard`) dùng, mà platform **không được phép** import module nghiệp vụ
 * (sẽ tạo phụ thuộc vòng). Nhiều module nghiệp vụ cũng dùng chung 2 type này.
 * Frontend có bản tương ứng ở `apps/web/src/core/types/index.ts`.
 */

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

/** Payload ký trong JWT và được gắn vào `request.user` sau khi xác thực. */
export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
