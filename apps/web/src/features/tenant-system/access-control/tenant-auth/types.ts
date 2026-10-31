import { z } from "zod";

export const actorSchema = z
  .object({
    accountId: z.uuid(),
    employeeId: z.string(),
    displayName: z.string(),
    role: z.enum(["EMPLOYEE", "MANAGER"]),
    isSystemAdmin: z.boolean(),
    sessionId: z.uuid(),
    username: z.string(),
    mustChangePassword: z.boolean(),
  })
  .strict();

export const setupSchema = z.object({
  needsSetup: z.boolean(),
  idleMinutes: z.number(),
});

export const sessionSchema = z.object({
  actor: actorSchema,
  idleMinutes: z.number(),
  expiresAt: z.iso.datetime(),
});

export const credentialSchema = z.object({
  username: z.string().trim().min(3, "Tên đăng nhập từ 3 ký tự").max(80),
  password: z
    .string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .max(72, "Mật khẩu tối đa 72 ký tự"),
});

export const firstAdminSchema = credentialSchema.extend({
  displayName: z.string().trim().min(1, "Nhập tên hiển thị").max(200),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .max(72, "Mật khẩu tối đa 72 ký tự"),
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  });

export type Actor = z.infer<typeof actorSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type SetupState = z.infer<typeof setupSchema>;
export type Credential = z.infer<typeof credentialSchema>;
export type FirstAdmin = z.infer<typeof firstAdminSchema>;
export type PasswordChange = z.infer<typeof passwordChangeSchema>;
