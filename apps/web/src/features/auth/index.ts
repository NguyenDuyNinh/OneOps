/**
 * Feature `auth` — dùng chung cho mọi bề mặt (admin và nhân viên).
 *
 * Sở hữu: phiên đăng nhập (`lib/auth-storage.ts`), HTTP client gắn token
 * (`lib/api-client.ts`), form đăng nhập, `AuthGuard`, định danh vai trò.
 */

export { AuthGuard } from "./components/AuthGuard";
export { useLogin } from "./hooks/useLogin";
export { authApi } from "./api/auth.api";
export { api, ApiError } from "./lib/api-client";
export { clearSession, getAccessToken, getCurrentUser, isAuthenticated, saveSession } from "./lib/auth-storage";
export { default as SignInForm } from "./SignInForm";
export { default as SignUpForm } from "./SignUpForm";
export { default as GridShape } from "./ui/GridShape";
export { default as ThemeTogglerTwo } from "./ui/ThemeTogglerTwo";
export { ThemeProvider, useTheme } from "./context/ThemeContext";
export { UserRole } from "./types";
export type { AuthenticatedUser, LoginDto, LoginResponse } from "./types";
