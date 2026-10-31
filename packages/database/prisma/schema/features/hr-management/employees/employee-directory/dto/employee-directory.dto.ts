import { z } from "zod";
export const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);
const emailField = z
  .string()
  .trim()
  .max(200)
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Email không hợp lệ",
  );
// Patch schemas must not carry defaults: Zod keeps them through `.partial()`,
// which would silently reset omitted fields to their default value.
const employeeFields = {
  code: z.string().trim().min(1).max(50),
  fullName: z.string().trim().min(1).max(200),
  email: emailField,
  phone: z.string().trim().max(40),
  jobTitle: z.string().trim().max(150),
  departmentName: z.string().trim().max(200),
  teamName: z.string().trim().max(200),
  managerName: z.string().trim().max(150),
  startDate: z.iso.date().nullish(),
  status: statusSchema,
  note: z.string().trim().max(2000),
};
export const createEmployeeSchema = z
  .object({
    ...employeeFields,
    email: employeeFields.email.default(""),
    phone: employeeFields.phone.default(""),
    jobTitle: employeeFields.jobTitle.default(""),
    departmentName: employeeFields.departmentName.default(""),
    teamName: employeeFields.teamName.default(""),
    managerName: employeeFields.managerName.default(""),
    status: employeeFields.status.default("ACTIVE"),
    note: employeeFields.note.default(""),
  })
  .strict();
export const updateEmployeeSchema = z
  .object(employeeFields)
  .partial()
  .extend({ version: z.number().int().positive() })
  .strict();
export const listQuery = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(200).optional(),
    status: statusSchema.optional(),
    departmentName: z.string().trim().max(200).optional(),
    jobTitle: z.string().trim().max(150).optional(),
  })
  .strict();
export const employeeSchema = z
  .object({
    ...employeeFields,
    id: z.uuid(),
    startDate: z.iso.date().nullable(),
    version: z.number().int().positive(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type EmployeeInput = z.input<typeof createEmployeeSchema>;
export type EmployeeDto = z.infer<typeof employeeSchema>;
export type ListQuery = z.infer<typeof listQuery>;
export type Status = z.infer<typeof statusSchema>;
