import { UserRole } from "@/features/auth";

/**
 * Contract của slice "quản lý tài khoản" (bề mặt admin).
 *
 * Kiến trúc vertical slice: FE tự sở hữu shape request/response của mình
 * (khớp `apps/api/src/modules/users/users.types.ts` + DTO class phía API).
 * `UserRole` là định danh dùng chung nên lấy từ `features/auth/types` — nơi
 * duy nhất của FE sở hữu khái niệm phiên đăng nhập/vai trò.
 */
export { UserRole };

/**
 * Cấu trúc phân trang của slice này.
 *
 * Cố ý khai báo lại thay vì dùng chung: bề mặt nhân viên (nếu sau này cần danh
 * sách) có thể có shape phân trang khác. Sửa ở đây không ảnh hưởng bề mặt khác.
 */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/** Bộ lọc trạng thái trên danh sách tài khoản. */
export type UserStatusFilter = "all" | "active" | "inactive";

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

/** Query của `GET /users`. */
export interface UserListQuery {
  page?: number;
  pageSize?: number;
  /** Tìm theo email hoặc tên. */
  q?: string;
  role?: UserRole;
  status?: UserStatusFilter;
}

/** Response có phân trang của `GET /users`. */
export interface PaginatedUsers extends Paginated<AdminUserListItem> {
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

/** Payload của `POST /users`. */
export interface CreateUserDto {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  avatarUrl?: string;
  departmentId?: string;
  managerId?: string;
  isActive?: boolean;
}

/** Payload của `PATCH /users/:id` — chỉ các trường hồ sơ, không đổi mật khẩu. */
export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
  avatarUrl?: string | null;
  departmentId?: string | null;
  managerId?: string | null;
}

/** Payload của `PATCH /users/:id/status`. */
export interface UpdateUserStatusDto {
  isActive: boolean;
}

/** Response của `PATCH /users/:id/status`. */
export interface UpdateUserStatusResponse {
  id: string;
  isActive: boolean;
}

/** Payload của `PATCH /users/:id/password` (admin đặt lại mật khẩu). */
export interface ResetUserPasswordDto {
  password: string;
}

/** Giá trị thô của form thêm/sửa tài khoản (trước khi chuẩn hoá thành DTO). */
export interface UserFormValues {
  email: string;
  name: string;
  role: UserRole;
  /** Chỉ dùng ở chế độ tạo mới. */
  password: string;
  /** Rỗng = không gán quản lý trực tiếp. */
  managerId: string;
}

/** Lựa chọn cho ô "Quản lý trực tiếp". */
export interface ManagerOption {
  id: string;
  name: string;
  email: string;
}
