import { z } from "zod";
export const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);
// Patch schemas must not carry defaults: Zod keeps them through `.partial()`,
// which would silently reset omitted fields to their default value.
const positionFields = {
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000),
  status: statusSchema,
};
const gradeFields = {
  code: z.string().trim().min(1).max(50),
  name: z.string().trim().min(1).max(200),
  rank: z.number().int().min(1).max(99),
  description: z.string().trim().max(2000),
  status: statusSchema,
  positionId: z.uuid().nullish(),
};
export const createPositionSchema = z
  .object({
    ...positionFields,
    description: positionFields.description.default(""),
    status: positionFields.status.default("ACTIVE"),
  })
  .strict();
export const updatePositionSchema = z
  .object(positionFields)
  .partial()
  .extend({ version: z.number().int().positive() })
  .strict();
export const createGradeSchema = z
  .object({
    ...gradeFields,
    rank: gradeFields.rank.default(1),
    description: gradeFields.description.default(""),
    status: gradeFields.status.default("ACTIVE"),
  })
  .strict();
export const updateGradeSchema = z
  .object(gradeFields)
  .partial()
  .extend({ version: z.number().int().positive() })
  .strict();
export const listQuery = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(100),
    q: z.string().trim().max(200).optional(),
    status: statusSchema.optional(),
    positionId: z.uuid().optional(),
  })
  .strict();
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
export type PositionInput = z.input<typeof createPositionSchema>;
export type PositionDto = z.infer<typeof positionSchema>;
export type GradeInput = z.input<typeof createGradeSchema>;
export type GradeDto = z.infer<typeof gradeSchema>;
export type ListQuery = z.infer<typeof listQuery>;
export type Status = z.infer<typeof statusSchema>;
