/**
 * [APP SHELL] — Khung giao diện quản trị: header, sidebar, sidebar state.
 *
 * Đây **không phải** feature nghiệp vụ: nó là hạ tầng hiển thị của bề mặt admin,
 * được `app/admin/layout.tsx` dùng. UI riêng của shell nằm ở `./ui/`.
 *
 * Theme (ThemeProvider/useTheme) KHÔNG ở đây — nó bọc toàn site nên thuộc `features/auth`.
 */

export { default as AppHeader } from "./components/AppHeader";
export { default as AppSidebar } from "./components/AppSidebar";
export { default as NotificationDropdown } from "./components/NotificationDropdown";
export { default as UserDropdown } from "./components/UserDropdown";
export { ThemeToggleButton } from "./components/ThemeToggleButton";

export { SidebarProvider, useSidebar } from "./context/SidebarContext";
// Theme (ThemeProvider/useTheme) KHÔNG còn ở đây: nó bọc toàn site ở `app/layout.tsx`,
// nên là hạ tầng dùng chung và thuộc `features/auth` (xem features/auth/index.ts).

// Navigation KHÔNG export ở đây: nó là module riêng `features/<surface>/navigation`
// (registry sinh tự động bởi `scripts/gen-nav.mjs`), tránh mọi người sửa chung một file.

export { SIDEBAR_CLASSES, SIDEBAR_PANEL } from "./constants";
