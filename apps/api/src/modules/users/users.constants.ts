/** Hằng số dùng riêng trong module quản lý tài khoản. */

/** Số vòng salt bcrypt — thống nhất với luồng đăng nhập. */
export const PASSWORD_SALT_ROUNDS = 10;

/** Số bản ghi mỗi trang khi không truyền `pageSize`. */
export const DEFAULT_PAGE_SIZE = 10;

/** Chặn client xin quá nhiều bản ghi trong một lần. */
export const MAX_PAGE_SIZE = 100;

/** Độ dài tối thiểu của mật khẩu do admin đặt. */
export const PASSWORD_MIN_LENGTH = 8;

/** Độ dài tối đa của mật khẩu (khớp DTO). */
export const PASSWORD_MAX_LENGTH = 128;
