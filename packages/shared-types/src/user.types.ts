// [SHARED] — Dev 1 setup ban đầu
// Thay đổi file này phải thông báo team

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  departmentId?: string;
  managerId?: string;
  createdAt: Date;
}

export interface JwtPayload {
  sub: string;        // userId
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
