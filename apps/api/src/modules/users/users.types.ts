// [USERS] — Hợp đồng dữ liệu của module Quản lý tài khoản (ADMIN).
// Payload request dùng class DTO trong `dto/`; file này giữ model + shape response.

import type { UserRole } from '../platform/types/identity.types';

/** Mô hình người dùng ở tầng domain — không chứa `passwordHash`. */
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

/** Bộ lọc trạng thái trên danh sách tài khoản. */
export type UserStatusFilter = 'all' | 'active' | 'inactive';

/** Một dòng trong bảng quản lý tài khoản (không bao giờ chứa passwordHash). */
export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  departmentId: string | null;
  managerId: string | null;
  /** Tên quản lý trực tiếp — null nếu chưa gán. */
  managerName: string | null;
  isActive: boolean;
  /** ISO 8601 — Date được serialize khi trả qua HTTP. */
  createdAt: string;
  updatedAt: string;
}

/** Query của `GET /users` (đã validate bởi `QueryUsersDto`). */
export interface UserListQuery {
  page?: number;
  pageSize?: number;
  /** Tìm theo email hoặc tên. */
  q?: string;
  role?: UserRole;
  status?: UserStatusFilter;
}

/** Response có phân trang của `GET /users`. */
export interface PaginatedUsers {
  items: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Số liệu tổng quan cho đầu trang quản lý tài khoản. */
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  managers: number;
  employees: number;
}

/** Response của `PATCH /users/:id/status`. */
export interface UpdateUserStatusResponse {
  id: string;
  isActive: boolean;
}
