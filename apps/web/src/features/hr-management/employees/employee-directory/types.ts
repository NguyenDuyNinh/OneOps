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
// Patch gửi lên phải không có default: Zod giữ default qua `.partial()` nên field
// bị bỏ trống sẽ bị ghi đè về giá trị mặc định.
const employeeFields = {
  code: z.string().trim().min(1, "Nhập mã nhân viên").max(50),
  fullName: z.string().trim().min(1, "Nhập họ tên").max(200),
  email: emailField,
  phone: z.string().trim().max(40),
  jobTitle: z.string().trim().max(150),
  departmentName: z.string().trim().max(200),
  teamName: z.string().trim().max(200),
  managerName: z.string().trim().max(150),
  startDate: z.iso.date("Ngày vào làm không hợp lệ").nullish(),
  status: statusSchema,
  note: z.string().trim().max(2000),
};
export const employeeInput = z
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
export const employeePatch = z.object(employeeFields).partial();
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
export const listSchema = z.object({
  items: z.array(employeeSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type Status = z.infer<typeof statusSchema>;
export type EmployeeInput = z.input<typeof employeeInput>;
export type EmployeeDto = z.infer<typeof employeeSchema>;
export type EmployeeList = z.infer<typeof listSchema>;
