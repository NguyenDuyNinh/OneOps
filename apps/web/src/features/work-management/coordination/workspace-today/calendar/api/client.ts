import { z } from "zod";
import {
  createSchema,
  recordSchema,
  type RecordInput,
  type RecordDto,
} from "@/features/work-management/coordination/workspace-today/calendar/types";
import { apiRequest } from "@/features/work-management/coordination/workspace-today/calendar/api/http";
export const client = {
  async list(signal?: AbortSignal) {
    const items: RecordDto[] = [];
    let page = 1;
    while (true) {
      const result = await apiRequest(
        "/calendar?page=" + page + "&pageSize=100",
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
      "/calendar/" + record.id,
      {
        method: "PATCH",
        body: JSON.stringify({ ...patch, version: record.version }),
      },
      recordSchema,
    ),
  remove: (record: RecordDto) =>
    apiRequest("/calendar/" + record.id, {
      method: "DELETE",
      body: JSON.stringify({ version: record.version }),
    }),
  create: (data: RecordInput) =>
    apiRequest(
      "/calendar",
      { method: "POST", body: JSON.stringify(createSchema.parse(data)) },
      recordSchema,
    ),
};
