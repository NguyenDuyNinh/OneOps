import {
  departmentInput,
  departmentPatch,
  departmentSchema,
  listSchema,
  teamInput,
  teamPatch,
  teamSchema,
  type DepartmentDto,
  type DepartmentInput,
  type TeamDto,
  type TeamInput,
} from "@/features/hr-management/organization/departments-teams/types";
import { apiRequest } from "@/features/hr-management/organization/departments-teams/api/http";
async function collect<T>(
  path: string,
  item: Parameters<typeof listSchema>[0],
  signal?: AbortSignal,
) {
  const schema = listSchema(item);
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const result = await apiRequest(
      `${path}${path.includes("?") ? "&" : "?"}page=${page}&pageSize=100`,
      { signal },
      schema,
    );
    items.push(...(result.items as T[]));
    if (items.length >= result.total || !result.items.length) return items;
  }
}
export const client = {
  listDepartments: (signal?: AbortSignal) =>
    collect<DepartmentDto>("/org/departments", departmentSchema, signal),
  listTeams: (departmentId: string, signal?: AbortSignal) =>
    collect<TeamDto>(
      `/org/teams?departmentId=${encodeURIComponent(departmentId)}`,
      teamSchema,
      signal,
    ),
  createDepartment: (data: DepartmentInput) =>
    apiRequest(
      "/org/departments",
      { method: "POST", body: JSON.stringify(departmentInput.parse(data)) },
      departmentSchema,
    ),
  updateDepartment: (record: DepartmentDto, patch: Partial<DepartmentInput>) =>
    apiRequest(
      "/org/departments/" + record.id,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...departmentPatch.parse(patch),
          version: record.version,
        }),
      },
      departmentSchema,
    ),
  createTeam: (data: TeamInput) =>
    apiRequest(
      "/org/teams",
      { method: "POST", body: JSON.stringify(teamInput.parse(data)) },
      teamSchema,
    ),
  updateTeam: (
    record: TeamDto,
    patch: Partial<Omit<TeamInput, "departmentId">>,
  ) =>
    apiRequest(
      "/org/teams/" + record.id,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...teamPatch.parse(patch),
          version: record.version,
        }),
      },
      teamSchema,
    ),
};
