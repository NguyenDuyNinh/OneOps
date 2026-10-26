import { UserRole } from "./types";

/** Số tài khoản mỗi trang. */
export const USERS_PAGE_SIZE = 10;

/** Thời gian chờ trước khi gửi từ khoá tìm kiếm (ms). */
export const SEARCH_DEBOUNCE_MS = 350;

/** Độ dài mật khẩu tối thiểu — khớp ràng buộc phía API. */
export const PASSWORD_MIN_LENGTH = 8;

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý",
  EMPLOYEE: "Nhân viên",
};

export const ROLE_BADGE_COLOR: Record<UserRole, "primary" | "info" | "light"> = {
  ADMIN: "primary",
  MANAGER: "info",
  EMPLOYEE: "light",
};

export interface SelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

export const ROLE_OPTIONS: ReadonlyArray<SelectOption<UserRole>> = [
  { value: UserRole.EMPLOYEE, label: ROLE_LABELS.EMPLOYEE },
  { value: UserRole.MANAGER, label: ROLE_LABELS.MANAGER },
  { value: UserRole.ADMIN, label: ROLE_LABELS.ADMIN },
];

export const ROLE_FILTER_OPTIONS: ReadonlyArray<SelectOption<UserRole | "">> = [
  { value: "", label: "Tất cả vai trò" },
  ...ROLE_OPTIONS,
];

export const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Đã vô hiệu hoá" },
] as const;

/** Bộ ký tự tránh nhầm lẫn khi đọc/đánh lại mật khẩu (bỏ 0/O, 1/l/I). */
const PASSWORD_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Sinh mật khẩu tạm ngẫu nhiên ngay trên trình duyệt (không gửi qua mạng). */
export function generatePassword(length = 12): string {
  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
    return "";
  }

  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => PASSWORD_CHARSET[byte % PASSWORD_CHARSET.length]).join("");
}
