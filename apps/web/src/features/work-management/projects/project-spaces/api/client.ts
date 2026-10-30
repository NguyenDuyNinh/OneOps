import { z } from "zod";
import {
  createSchema,
  recordSchema,
  type RecordInput,
  type RecordDto,
} from "@/features/work-management/projects/project-spaces/types";
import { apiRequest } from "@/features/work-management/projects/project-spaces/api/http";
export const client = {
  async list(signal?: AbortSignal) {
    const items: RecordDto[] = [];
    let page = 1;
    while (true) {
      const result = await apiRequest(
        "/projects?page=" + page + "&pageSize=100",
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
      "/projects/" + record.id,
      {
        method: "PATCH",
        body: JSON.stringify({ ...patch, version: record.version }),
      },
      recordSchema,
    ),
  remove: (record: RecordDto) =>
    apiRequest("/projects/" + record.id, {
      method: "DELETE",
      body: JSON.stringify({ version: record.version }),
    }),
  create: (data: RecordInput) =>
    apiRequest(
      "/projects",
      { method: "POST", body: JSON.stringify(createSchema.parse(data)) },
      recordSchema,
    ),
};
