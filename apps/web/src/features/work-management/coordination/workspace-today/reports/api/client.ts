import { workspaceSummarySchema } from "@/features/work-management/coordination/workspace-today/reports/types";
import { z } from "zod";
import {
  createSchema,
  recordSchema,
  type RecordInput,
  type RecordDto,
} from "@/features/work-management/coordination/workspace-today/reports/types";
import { apiRequest } from "@/features/work-management/coordination/workspace-today/reports/api/http";
export const client = {
  async list(signal?: AbortSignal) {
    const items: RecordDto[] = [];
    let page = 1;
    while (true) {
      const result = await apiRequest(
        "/reports?page=" + page + "&pageSize=100",
        { signal },
        z.object({
          items: z.array(recordSchema),
          total: z.number(),
          page: z.number(),
          pageSize: z.number(),
        }),
      );
      items.push(...result.items);
      if (items.length >= result.total || !result.items.length) return items;
      page++;
    }
  },
  update: (record: RecordDto, patch: Partial<RecordInput>) =>
    apiRequest(
      "/reports/" + record.id,
      {
        method: "PATCH",
        body: JSON.stringify({ ...patch, version: record.version }),
      },
      recordSchema,
    ),
  remove: (record: RecordDto) =>
    apiRequest("/reports/" + record.id, {
      method: "DELETE",
      body: JSON.stringify({ version: record.version }),
    }),
  summary: (signal?: AbortSignal) =>
    apiRequest("/workspace/summary", { signal }, workspaceSummarySchema),
  create: (data: RecordInput) =>
    apiRequest(
      "/reports",
      { method: "POST", body: JSON.stringify(createSchema.parse(data)) },
      recordSchema,
    ),
};
