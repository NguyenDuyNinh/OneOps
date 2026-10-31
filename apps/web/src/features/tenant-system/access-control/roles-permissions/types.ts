import { z } from "zod";

export const permissionRoleSchema = z.enum(["EMPLOYEE", "MANAGER"]);
export const permissionActionSchema = z.enum([
  "view",
  "create",
  "update",
  "delete",
  "approve",
  "manage",
]);
export const featureGroupSchema = z.enum([
  "tenant-system",
  "work-management",
  "hr-management",
  "crm",
]);
export const matrixRowSchema = z
  .object({
    featureKey: z.string().min(1),
    group: featureGroupSchema,
    label: z.string().min(1),
    role: permissionRoleSchema,
    actions: z.array(permissionActionSchema),
    version: z.number().int().min(0),
    isDefault: z.boolean(),
  })
  .strict();
export const matrixSchema = z
  .object({
    items: z.array(matrixRowSchema),
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
          featureKey: z.string().min(1),
          actions: z.array(permissionActionSchema),
        })
        .strict(),
    ),
  })
  .strict();
export const permissionChangeSchema = z
  .object({
    id: z.uuid(),
    featureKey: z.string().min(1),
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
export const saveInput = z
  .object({
    items: z
      .array(
        z
          .object({
            featureKey: z.string().min(1),
            role: permissionRoleSchema,
            actions: z.array(permissionActionSchema),
            version: z.number().int().min(0),
          })
          .strict(),
      )
      .min(1),
    reason: z.string().trim().max(500),
  })
  .strict();

export type PermissionRole = z.infer<typeof permissionRoleSchema>;
export type PermissionAction = z.infer<typeof permissionActionSchema>;
export type FeatureGroup = z.infer<typeof featureGroupSchema>;
export type MatrixRow = z.infer<typeof matrixRowSchema>;
export type Matrix = z.infer<typeof matrixSchema>;
export type MyPermissions = z.infer<typeof myPermissionsSchema>;
export type PermissionChange = z.infer<typeof permissionChangeSchema>;
export type SaveInput = z.input<typeof saveInput>;
