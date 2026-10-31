import { z } from "zod";
export const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);
// Patch schemas must not carry defaults: Zod keeps them through `.partial()`,
// which would silently reset omitted fields to their default value.
const departmentFields = {
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000),
  managerName: z.string().trim().max(150),
  status: statusSchema,
};
const teamFields = {
  departmentId: z.uuid(),
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000),
  managerName: z.string().trim().max(150),
  status: statusSchema,
};
export const createDepartmentSchema = z
  .object({
    ...departmentFields,
    description: departmentFields.description.default(""),
    managerName: departmentFields.managerName.default(""),
    status: departmentFields.status.default("ACTIVE"),
  })
  .strict();
export const updateDepartmentSchema = z
  .object(departmentFields)
  .partial()
  .extend({ version: z.number().int().positive() })
  .strict();
export const createTeamSchema = z
  .object({
    ...teamFields,
    description: teamFields.description.default(""),
    managerName: teamFields.managerName.default(""),
    status: teamFields.status.default("ACTIVE"),
  })
  .strict();
export const updateTeamSchema = z
  .object(teamFields)
  .omit({ departmentId: true })
  .partial()
  .extend({ version: z.number().int().positive() })
  .strict();
export const listQuery = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(100),
    q: z.string().trim().max(200).optional(),
    status: statusSchema.optional(),
    departmentId: z.uuid().optional(),
  })
  .strict();
export const departmentSchema = z
  .object({
    ...departmentFields,
    id: z.uuid(),
    teamCount: z.number().int().min(0),
    activeTeamCount: z.number().int().min(0),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export const teamSchema = z
  .object({
    ...teamFields,
    id: z.uuid(),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type DepartmentInput = z.input<typeof createDepartmentSchema>;
export type DepartmentDto = z.infer<typeof departmentSchema>;
export type TeamInput = z.input<typeof createTeamSchema>;
export type TeamDto = z.infer<typeof teamSchema>;
export type ListQuery = z.infer<typeof listQuery>;
export type Status = z.infer<typeof statusSchema>;
