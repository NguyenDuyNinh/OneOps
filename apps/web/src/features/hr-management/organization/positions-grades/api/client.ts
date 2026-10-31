import {
  gradeInput,
  gradePatch,
  gradeSchema,
  listSchema,
  positionInput,
  positionPatch,
  positionSchema,
  type GradeDto,
  type GradeInput,
  type PositionDto,
  type PositionInput,
} from "@/features/hr-management/organization/positions-grades/types";
import { apiRequest } from "@/features/hr-management/organization/positions-grades/api/http";
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
  listPositions: (signal?: AbortSignal) =>
    collect<PositionDto>("/org/positions", positionSchema, signal),
  listGrades: (positionId?: string, signal?: AbortSignal) =>
    collect<GradeDto>(
      positionId
        ? `/org/grades?positionId=${encodeURIComponent(positionId)}`
        : "/org/grades",
      gradeSchema,
      signal,
    ),
  createPosition: (data: PositionInput) =>
    apiRequest(
      "/org/positions",
      { method: "POST", body: JSON.stringify(positionInput.parse(data)) },
      positionSchema,
    ),
  updatePosition: (record: PositionDto, patch: Partial<PositionInput>) =>
    apiRequest(
      "/org/positions/" + record.id,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...positionPatch.parse(patch),
          version: record.version,
        }),
      },
      positionSchema,
    ),
  createGrade: (data: GradeInput) =>
    apiRequest(
      "/org/grades",
      { method: "POST", body: JSON.stringify(gradeInput.parse(data)) },
      gradeSchema,
    ),
  updateGrade: (record: GradeDto, patch: Partial<GradeInput>) =>
    apiRequest(
      "/org/grades/" + record.id,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...gradePatch.parse(patch),
          version: record.version,
        }),
      },
      gradeSchema,
    ),
};
