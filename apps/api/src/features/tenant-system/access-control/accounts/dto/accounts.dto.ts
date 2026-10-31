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
// Patch schemas must not carry defaults: Zod keeps them through `.partial()`,
// which would silently reset omitted fields to their default value.
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
  role: accountRoleSchema,
  isSystemAdmin: z.boolean(),
  status: accountStatusSchema,
  lockedReason: z.string().trim().max(500),
};
export const createAccountSchema = z
  .object({
    ...accountFields,
    email: accountFields.email.default(""),
    employeeCode: accountFields.employeeCode.default(""),
    role: accountFields.role.default("EMPLOYEE"),
    isSystemAdmin: accountFields.isSystemAdmin.default(false),
    status: accountFields.status.default("ACTIVE"),
    lockedReason: accountFields.lockedReason.default(""),
    password: passwordField,
    actorName: z.string().trim().min(1).max(200),
  })
  .strict();
export const updateAccountSchema = z
  .object({
    username: accountFields.username,
    displayName: accountFields.displayName,
    email: accountFields.email,
    employeeCode: accountFields.employeeCode,
  })
  .partial()
  .extend({ version: z.number().int().positive() })
  .strict();
export const changeAccessSchema = z
  .object({
    role: accountRoleSchema.optional(),
    isSystemAdmin: z.boolean().optional(),
    status: accountStatusSchema.optional(),
    lockedReason: z.string().trim().max(500).optional(),
    actorName: z.string().trim().min(1).max(200),
    reason: z.string().trim().max(500).optional(),
    version: z.number().int().positive(),
  })
  .strict();
export const resetPasswordSchema = z
  .object({
    password: passwordField,
    actorName: z.string().trim().min(1).max(200),
    reason: z.string().trim().max(500).optional(),
    version: z.number().int().positive(),
  })
  .strict();
export const listQuery = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(100),
    q: z.string().trim().max(200).optional(),
    role: accountRoleSchema.optional(),
    status: accountStatusSchema.optional(),
  })
  .strict();
export const accountSchema = z
  .object({
    ...accountFields,
    id: z.uuid(),
    mustChangePassword: z.boolean(),
    lastLoginAt: z.iso.datetime().nullable(),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
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
export type AccountInput = z.infer<typeof createAccountSchema>;
export type AccountPatch = z.infer<typeof updateAccountSchema>;
export type AccessChange = z.infer<typeof changeAccessSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type AccountDto = z.infer<typeof accountSchema>;
export type ListQuery = z.infer<typeof listQuery>;
export type AccountRole = z.infer<typeof accountRoleSchema>;
export type AccountStatus = z.infer<typeof accountStatusSchema>;
export type AccessChangeKind = z.infer<typeof accessChangeKindSchema>;
