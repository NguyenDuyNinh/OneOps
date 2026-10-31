import { z } from "zod";
import {
  acceptanceInputSchema,
  acceptancePageSchema,
  acceptancePatchSchema,
  acceptanceResultSchema,
  acceptanceItemSchema,
  createSchema,
  milestoneDetailSchema,
  milestonePageSchema,
  milestoneSchema,
  referenceSchema,
  resultInputSchema,
  type AcceptanceInput,
  type AcceptanceItem,
  type AcceptancePatch,
  type MilestoneDetail,
  type MilestoneDto,
  type MilestoneInput,
  type MilestoneUpdate,
  type ResultInput,
} from "@/features/work-management/projects/milestones-qa/types";
import { apiRequest } from "@/features/work-management/projects/milestones-qa/api/http";

/** Reads another domain's records through its public REST list endpoint. */
async function references(path: string, signal?: AbortSignal) {
  const page = await apiRequest(
    path,
    { signal },
    z.object({
      items: z.array(referenceSchema),
      total: z.number(),
      page: z.number(),
      pageSize: z.number(),
    }),
  );
  return page.items;
}

export const client = {
  async list(signal?: AbortSignal) {
    const items: MilestoneDto[] = [];
    let page = 1;
    while (true) {
      const result = await apiRequest(
        "/milestones?page=" + page + "&pageSize=100",
        { signal },
        milestonePageSchema,
      );
      items.push(...result.items);
      if (items.length >= result.total || !result.items.length) return items;
      page++;
    }
  },
  get: (id: string, signal?: AbortSignal) =>
    apiRequest(
      "/milestones/" + id,
      { signal },
      milestoneDetailSchema,
    ) as Promise<MilestoneDetail>,
  create: (input: MilestoneInput) =>
    apiRequest(
      "/milestones",
      { method: "POST", body: JSON.stringify(createSchema.parse(input)) },
      milestoneSchema,
    ),
  update: (milestone: MilestoneDto, patch: MilestoneUpdate) =>
    apiRequest(
      "/milestones/" + milestone.id,
      {
        method: "PATCH",
        body: JSON.stringify({ ...patch, version: milestone.version }),
      },
      milestoneSchema,
    ),
  link: (id: string, taskIds: string[]) =>
    apiRequest(
      "/milestones/" + id + "/items",
      { method: "POST", body: JSON.stringify({ taskIds }) },
      milestoneDetailSchema,
    ) as Promise<MilestoneDetail>,
  unlink: (id: string, taskId: string) =>
    apiRequest(
      "/milestones/" + id + "/items/" + taskId,
      { method: "DELETE" },
      milestoneDetailSchema,
    ) as Promise<MilestoneDetail>,
  acceptance: (taskId: string, signal?: AbortSignal) =>
    apiRequest(
      "/acceptance?taskId=" + taskId,
      { signal },
      acceptancePageSchema,
    ),
  createAcceptance: (input: AcceptanceInput) =>
    apiRequest(
      "/acceptance",
      {
        method: "POST",
        body: JSON.stringify(acceptanceInputSchema.parse(input)),
      },
      acceptanceItemSchema,
    ),
  updateAcceptance: (item: AcceptanceItem, patch: AcceptancePatch) =>
    apiRequest(
      "/acceptance/" + item.id,
      {
        method: "PATCH",
        body: JSON.stringify({
          ...acceptancePatchSchema.parse(patch),
          version: item.version,
        }),
      },
      acceptanceItemSchema,
    ),
  removeAcceptance: (item: AcceptanceItem) =>
    apiRequest("/acceptance/" + item.id, {
      method: "DELETE",
      body: JSON.stringify({ version: item.version }),
    }),
  recordResult: (itemId: string, input: ResultInput) =>
    apiRequest(
      "/acceptance/" + itemId + "/results",
      { method: "POST", body: JSON.stringify(resultInputSchema.parse(input)) },
      acceptanceResultSchema,
    ),
  /** Reference options for the pickers; both lists are paginated server-side. */
  projects: (signal?: AbortSignal) =>
    references("/projects?pageSize=100", signal),
  tasks: (signal?: AbortSignal) => references("/tasks?pageSize=100", signal),
};
