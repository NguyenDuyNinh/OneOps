/**
 * Types domain dùng chung toàn app.
 *
 * Quy ước: type dùng CHUNG đặt ở đây; type chỉ dùng trong 1 module
 * đặt tại `src/features/<module>/types.ts`. Không định nghĩa lại cùng
 * một type ở 2 nơi (CLEANCODE.md rule 8).
 */

/** Trạng thái chung của các thực thể quản lý (đơn hàng, yêu cầu, vé...). */
export type EntityStatus = "draft" | "active" | "archived";

/** Cấu trúc phân trang chuẩn cho mọi bảng trong webapp quản lý. */
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/** Shape lỗi API chuẩn hóa — khớp ApiError ở `src/lib/api-client.ts`. */
export interface ApiErrorShape {
  status: number;
  message: string;
  payload?: unknown;
}
