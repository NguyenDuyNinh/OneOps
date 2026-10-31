import { z } from "zod";
import { PERMISSION_ACTIONS } from "../../../../../core/auth/actor-context.js";
import {
  assignableActions,
  isCatalogKey,
  permissionCatalog,
} from "../permission-catalog.js";

export const permissionRoleSchema = z.enum(["EMPLOYEE", "MANAGER"]);
export const permissionActionSchema = z.enum(PERMISSION_ACTIONS);
export const featureGroupSchema = z.enum([
  "tenant-system",
  "work-management",
  "hr-management",
  "crm",
]);
export const featureKeySchema = z
  .string()
  .trim()
  .max(120)
  .refine(isCatalogKey, "Chức năng không thuộc danh mục quyền");

export const saveRowSchema = z
  .object({
    featureKey: featureKeySchema,
    role: permissionRoleSchema,
    actions: z
      .array(permissionActionSchema)
      .max(assignableActions.length, "Số quyền vượt quá danh mục"),
    version: z.number().int().min(0),
  })
  .strict();

export const saveMatrixSchema = z
  .object({
    items: z
      .array(saveRowSchema)
      .min(1)
      .max(permissionCatalog.length * 2),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const permissionRowSchema = z
  .object({
    featureKey: featureKeySchema,
    group: featureGroupSchema,
    label: z.string().min(1).max(200),
    role: permissionRoleSchema,
    actions: z.array(permissionActionSchema),
    version: z.number().int().min(0),
    isDefault: z.boolean(),
  })
  .strict();

export const matrixSchema = z
  .object({
    items: z.array(permissionRowSchema),
    actions: z.array(permissionActionSchema),
    roles: z.array(permissionRoleSchema),
  })
  .strict();

export const myPermissionsSchema = z
  .object({
    role: permissionRoleSchema,
    isSystemAdmin: z.boolean(),
    canManage: z.boolean(),
    items: z.array(
      z
        .object({
          featureKey: featureKeySchema,
          actions: z.array(permissionActionSchema),
        })
        .strict(),
    ),
  })
  .strict();

export const permissionChangeSchema = z
  .object({
    id: z.uuid(),
    featureKey: featureKeySchema,
    role: permissionRoleSchema,
    fromActions: z.array(permissionActionSchema),
    toActions: z.array(permissionActionSchema),
    actorName: z.string(),
    reason: z.string(),
    createdAt: z.iso.datetime(),
  })
  .strict();

export const historySchema = z.object({
  items: z.array(permissionChangeSchema),
});

export type PermissionRole = z.infer<typeof permissionRoleSchema>;
export type PermissionAction = z.infer<typeof permissionActionSchema>;
export type SaveRow = z.infer<typeof saveRowSchema>;
export type SaveMatrix = z.infer<typeof saveMatrixSchema>;
export type PermissionRow = z.infer<typeof permissionRowSchema>;
export type Matrix = z.infer<typeof matrixSchema>;
export type MyPermissions = z.infer<typeof myPermissionsSchema>;
export type PermissionChangeDto = z.infer<typeof permissionChangeSchema>;
