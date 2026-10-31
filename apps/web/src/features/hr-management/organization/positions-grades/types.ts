import { z } from "zod";
export const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);
// Patch gửi lên phải không có default: Zod giữ default qua `.partial()` nên field
// bị bỏ trống sẽ bị ghi đè về giá trị mặc định.
const positionFields = {
  code: z.string().trim().min(1, "Nhập mã chức danh").max(50),
  name: z.string().trim().min(1, "Nhập tên chức danh").max(200),
  description: z.string().trim().max(2000),
  status: statusSchema,
};
const gradeFields = {
  code: z.string().trim().min(1, "Nhập mã cấp bậc").max(50),
  name: z.string().trim().min(1, "Nhập tên cấp bậc").max(200),
  rank: z.number().int().min(1, "Thứ tự từ 1").max(99, "Thứ tự tối đa 99"),
  description: z.string().trim().max(2000),
  status: statusSchema,
  positionId: z.uuid().nullish(),
};
export const positionInput = z
  .object({
    ...positionFields,
    description: positionFields.description.default(""),
    status: positionFields.status.default("ACTIVE"),
  })
  .strict();
export const positionPatch = z.object(positionFields).partial();
export const gradeInput = z
  .object({
    ...gradeFields,
    description: gradeFields.description.default(""),
    status: gradeFields.status.default("ACTIVE"),
  })
  .strict();
export const gradePatch = z.object(gradeFields).partial();
export const positionSchema = z
  .object({
    ...positionFields,
    id: z.uuid(),
    gradeCount: z.number().int().min(0),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export const gradeSchema = z
  .object({
    ...gradeFields,
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
export type PositionInput = z.input<typeof positionInput>;
export type PositionDto = z.infer<typeof positionSchema>;
export type GradeInput = z.input<typeof gradeInput>;
export type GradeDto = z.infer<typeof gradeSchema>;
