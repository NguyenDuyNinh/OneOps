import { z } from "zod";
import {
  createSchema,
  recordSchema,
  type RecordDto,
  type RecordInput,
  type TaskUpdate,
} from "@/features/work-management/work/tasks/types";
import { apiRequest } from "@/features/work-management/work/tasks/api/http";

const pageSchema = z
  .object({
    items: z.array(recordSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
  .strict();

export const client = {
  async list(signal?: AbortSignal) {
    const items: RecordDto[] = [];
    let page = 1;
    while (true) {
      const result = await apiRequest(
        "/tasks?page=" + page + "&pageSize=100",
        { signal },
        pageSchema,
      );
      items.push(...result.items);
      if (items.length >= result.total || !result.items.length) return items;
      page++;
    }
  },
  get: (id: string) => apiRequest(`/tasks/${id}`, {}, recordSchema),
  create: (data: RecordInput) =>
    apiRequest(
      "/tasks",
      { method: "POST", body: JSON.stringify(createSchema.parse(data)) },
      recordSchema,
    ),
  update: (record: RecordDto, patch: TaskUpdate) =>
    apiRequest(
      "/tasks/" + record.id,
      {
        method: "PATCH",
        body: JSON.stringify({ ...patch, version: record.version }),
      },
      recordSchema,
    ),
  remove: (record: RecordDto) =>
    apiRequest("/tasks/" + record.id, {
      method: "DELETE",
      body: JSON.stringify({ version: record.version }),
    }),
};
