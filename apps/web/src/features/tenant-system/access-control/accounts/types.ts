import { z } from "zod";
export const accountRoleSchema = z.enum(["EMPLOYEE", "MANAGER"]);
export const accountStatusSchema = z.enum(["ACTIVE", "LOCKED"]);
export const accessChangeKindSchema = z.enum([
  "ROLE",
  "ADMIN",
  "STATUS",
  "PASSWORD",
]);
const emailField = z
  .string()
  .trim()
  .max(200)
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Email không hợp lệ",
  );
export const passwordField = z
  .string()
  .min(8, "Mật khẩu tối thiểu 8 ký tự")
  .max(72, "Mật khẩu tối đa 72 ký tự");
// Patch gửi lên phải không có default: Zod giữ default qua `.partial()` nên field
// bị bỏ trống sẽ bị ghi đè về giá trị mặc định.
const accountFields = {
  username: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập từ 3 ký tự")
    .max(80)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Tên đăng nhập chỉ dùng chữ, số, dấu chấm, gạch dưới và gạch ngang",
    ),
  displayName: z.string().trim().min(1, "Nhập tên hiển thị").max(200),
  email: emailField,
  employeeCode: z.string().trim().max(50),
};
export const accountInput = z
  .object({
    ...accountFields,
    email: accountFields.email.default(""),
    employeeCode: accountFields.employeeCode.default(""),
    role: accountRoleSchema.default("EMPLOYEE"),
    isSystemAdmin: z.boolean().default(false),
    password: passwordField,
    actorName: z.string().trim().min(1, "Nhập người thực hiện").max(200),
  })
  .strict();
export const accountPatch = z
  .object({
    ...accountFields,
    actorName: z.string().trim().min(1).max(200),
  })
  .partial();
export const changeAccessInput = z
  .object({
    role: accountRoleSchema,
    isSystemAdmin: z.boolean(),
    status: accountStatusSchema,
    lockedReason: z.string().trim().max(500),
    actorName: z.string().trim().min(1, "Nhập người thực hiện").max(200),
    reason: z.string().trim().max(500),
  })
  .strict();
export const resetPasswordInput = z
  .object({
    password: passwordField,
    actorName: z.string().trim().min(1, "Nhập người thực hiện").max(200),
    reason: z.string().trim().max(500),
  })
  .strict();
export const accountSchema = z
  .object({
    id: z.uuid(),
    ...accountFields,
    role: accountRoleSchema,
    isSystemAdmin: z.boolean(),
    status: accountStatusSchema,
    lockedReason: z.string(),
    mustChangePassword: z.boolean(),
    lastLoginAt: z.iso.datetime().nullable(),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export const listSchema = z.object({
  items: z.array(accountSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export const accessChangeSchema = z
  .object({
    id: z.uuid(),
    kind: accessChangeKindSchema,
    fromValue: z.string(),
    toValue: z.string(),
    actorName: z.string(),
    reason: z.string(),
    createdAt: z.iso.datetime(),
  })
  .strict();
export const historySchema = z.object({ items: z.array(accessChangeSchema) });
export type AccountRole = z.infer<typeof accountRoleSchema>;
export type AccountProfile = z.input<typeof accountPatch>;
export type AccountStatus = z.infer<typeof accountStatusSchema>;
export type AccessChangeKind = z.infer<typeof accessChangeKindSchema>;
export type AccountInput = z.input<typeof accountInput>;
export type ChangeAccessInput = z.input<typeof changeAccessInput>;
export type ResetPasswordInput = z.input<typeof resetPasswordInput>;
export type AccountDto = z.infer<typeof accountSchema>;
export type AccessChange = z.infer<typeof accessChangeSchema>;
