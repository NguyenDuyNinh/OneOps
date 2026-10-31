import { z } from "zod";

export const loginSchema = z
  .object({
    username: z.string().trim().min(1, "Nhập tên đăng nhập").max(80),
    password: z.string().min(1, "Nhập mật khẩu").max(72),
  })
  .strict();

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại").max(72),
    newPassword: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .max(72, "Mật khẩu tối đa 72 ký tự"),
  })
  .strict();

export const actorSchema = z
  .object({
    accountId: z.uuid(),
    employeeId: z.string(),
    username: z.string(),
    displayName: z.string(),
    role: z.enum(["EMPLOYEE", "MANAGER"]),
    isSystemAdmin: z.boolean(),
    mustChangePassword: z.boolean(),
    sessionId: z.uuid(),
  })
  .strict();

export const sessionResultSchema = z
  .object({
    actor: actorSchema,
    idleMinutes: z.number().int().positive(),
    expiresAt: z.iso.datetime(),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type SessionActor = z.infer<typeof actorSchema>;
export type SessionResult = z.infer<typeof sessionResultSchema>;
