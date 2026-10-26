// Cấu hình môi trường riêng của module Auth.
// Không hardcode secret trong source code (AGENTS.md — điều 9).

import { Logger } from '@nestjs/common';
import type { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

const logger = new Logger('AuthConfig');

/** Đọc biến môi trường bắt buộc, dừng ứng dụng ngay nếu thiếu. */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}`);
  }
  return value;
}

/** Đọc biến môi trường có giá trị mặc định (dùng cho cấu hình không nhạy cảm). */
export function getOptionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : fallback;
}

/**
 * Cấu hình JWT được đọc lazy tại thời điểm DI khởi tạo — sau khi `dotenv` đã nạp `.env`.
 * Tránh việc `process.env` còn rỗng lúc module được import.
 */
export function buildJwtOptions(): JwtModuleOptions {
  const secret = getRequiredEnv('JWT_SECRET');
  if (secret.length < 32) {
    logger.warn('JWT_SECRET ngắn hơn 32 ký tự — nên dùng secret dài và ngẫu nhiên ở production.');
  }

  return {
    secret,
    signOptions: {
      expiresIn: getOptionalEnv('JWT_EXPIRES_IN', '7d') as JwtSignOptions['expiresIn'],
    },
  };
}
