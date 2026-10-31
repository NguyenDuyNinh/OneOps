import { z } from "zod";
export const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);
// Patch gửi lên phải không có default: Zod giữ default qua `.partial()` nên field
// bị bỏ trống sẽ bị ghi đè về giá trị mặc định.
const departmentFields = {
  code: z.string().trim().min(1, "Nhập mã phòng ban").max(50),
  name: z.string().trim().min(1, "Nhập tên phòng ban").max(200),
  description: z.string().trim().max(2000),
  managerName: z.string().trim().max(150),
  status: statusSchema,
};
const teamFields = {
  departmentId: z.uuid(),
  code: z.string().trim().min(1, "Nhập mã nhóm").max(50),
  name: z.string().trim().min(1, "Nhập tên nhóm").max(200),
  description: z.string().trim().max(2000),
  managerName: z.string().trim().max(150),
  status: statusSchema,
};
export const departmentInput = z
  .object({
    ...departmentFields,
    description: departmentFields.description.default(""),
    managerName: departmentFields.managerName.default(""),
    status: departmentFields.status.default("ACTIVE"),
  })
  .strict();
export const departmentPatch = z.object(departmentFields).partial();
export const teamInput = z
  .object({
    ...teamFields,
    description: teamFields.description.default(""),
    managerName: teamFields.managerName.default(""),
    status: teamFields.status.default("ACTIVE"),
  })
  .strict();
export const teamPatch = z
  .object(teamFields)
  .omit({ departmentId: true })
  .partial();
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
export const listSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  });
export type Status = z.infer<typeof statusSchema>;
export type DepartmentInput = z.input<typeof departmentInput>;
export type DepartmentDto = z.infer<typeof departmentSchema>;
export type TeamInput = z.input<typeof teamInput>;
export type TeamDto = z.infer<typeof teamSchema>;
