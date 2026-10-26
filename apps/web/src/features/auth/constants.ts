/**
 * Hằng số của tầng gọi API — thuộc feature `auth` vì `lib/api-client.ts` (bên
 * gắn token cho mọi request) sống ở đây.
 */

/**
 * Base URL mặc định của NestJS API khi chạy local.
 * Production BẮT BUỘC khai báo `NEXT_PUBLIC_API_BASE_URL` trong môi trường.
 */
export const DEFAULT_API_BASE_URL = "http://localhost:4000";

/** Timeout chung cho API client (ms). */
export const API_TIMEOUT_MS = 30_000;
