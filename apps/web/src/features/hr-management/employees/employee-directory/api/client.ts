import {
  employeeInput,
  employeePatch,
  employeeSchema,
  listSchema,
  type EmployeeDto,
  type EmployeeInput,
} from "@/features/hr-management/employees/employee-directory/types";
import { apiRequest } from "@/features/hr-management/employees/employee-directory/api/http";
async function collect(signal?: AbortSignal) {
  const items: EmployeeDto[] = [];
  for (let page = 1; ; page++) {
    const result = await apiRequest(
      `/employees?page=${page}&pageSize=100`,
      { signal },
      listSchema,
    );
    items.push(...result.items);
    if (items.length >= result.total || !result.items.length) return items;
  }
}
export const client = {
  list: (signal?: AbortSignal) => collect(signal),
  create: (data: EmployeeInput) =>
    apiRequest(
      "/employees",
      { method: "POST", body: JSON.stringify(employeeInput.parse(data)) },
      employeeSchema,
    ),
  update: (record: EmployeeDto, patch: Partial<EmployeeInput>) =>
    apiRequest(
      "/employees/" + record.id,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...employeePatch.parse(patch),
          version: record.version,
        }),
      },
      employeeSchema,
    ),
};
