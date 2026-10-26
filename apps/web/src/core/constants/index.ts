export const DEFAULT_PAGE_SIZE = 10;

/** Timeout chung cho API client (ms). */
export const API_TIMEOUT_MS = 30_000;

/**
 * Kích thước sidebar (rail + panel phụ). Class Tailwind đặt dạng literal tĩnh
 * để JIT scanner thấy được — không compose chuỗi động.
 * - Rail: gọn kiểu icon-only (w-16), label chỉ hiện qua tooltip khi hover.
 * - Panel phụ: hiện CẠNH rail khi bấm section có menu con — nằm trong flex,
 *   mở ra PUSH nội dung sang phải (animate width w-0 ↔ panelWidth).
 *   Panel KÉO được mép phải để đổi rộng (min ↔ max), lưu localStorage.
 */
export const SIDEBAR_CLASSES = {
  railWidth: "w-16",
} as const;

export const SIDEBAR_PANEL = {
  defaultWidth: 240,
  minWidth: 180,
  maxWidth: 420,
  storageKey: "h2base_panelWidth",
} as const;
