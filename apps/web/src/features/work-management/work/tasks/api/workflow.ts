import { z } from "zod";
import {
  allowedResponseSchema,
  decisionInput,
  proposalInput,
  proposalSchema,
  taskStateSchema,
  type AllowedEntry,
  type DecisionInput,
  type ProposalInput,
  type TaskProposal,
  type TaskState,
} from "@/features/work-management/work/tasks/types";
import { apiRequest } from "@/features/work-management/work/tasks/api/http";

const proposalPageSchema = z
  .object({
    items: z.array(proposalSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
  .strict();

export type TransitionRequest = {
  toStatus: string;
  version: number;
  reason?: string;
  overrideReason?: string;
};

/** A fresh key per submission keeps a double click from recording two moves. */
const requestKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `key-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const workflow = {
  state: (taskId: string, signal?: AbortSignal): Promise<TaskState> =>
    apiRequest(
      `/task-workflow/tasks/${taskId}/state`,
      { signal },
      taskStateSchema,
    ),
  async allowed(
    taskIds: readonly string[],
    signal?: AbortSignal,
  ): Promise<AllowedEntry[]> {
    if (!taskIds.length) return [];
    const ids = taskIds.slice(0, 200).join(",");
    const result = await apiRequest(
      `/task-workflow/allowed?taskIds=${encodeURIComponent(ids)}`,
      { signal },
      allowedResponseSchema,
    );
    return result.items;
  },
  async transition(taskId: string, input: TransitionRequest) {
    return apiRequest(
      `/task-workflow/tasks/${taskId}/transitions`,
      {
        method: "POST",
        headers: { "Idempotency-Key": requestKey() },
        body: JSON.stringify(input),
      },
      taskStateSchema,
    );
  },
  async propose(taskId: string, input: ProposalInput): Promise<TaskProposal> {
    return apiRequest(
      `/task-workflow/tasks/${taskId}/proposals`,
      {
        method: "POST",
        headers: { "Idempotency-Key": requestKey() },
        body: JSON.stringify(proposalInput.parse(input)),
      },
      proposalSchema,
    );
  },
  async decide(id: string, input: DecisionInput): Promise<TaskProposal> {
    return apiRequest(
      `/task-workflow/proposals/${id}/decision`,
      {
        method: "POST",
        body: JSON.stringify(decisionInput.parse(input)),
      },
      proposalSchema,
    );
  },
  proposals: (taskId: string, signal?: AbortSignal) =>
    apiRequest(
      `/task-workflow/proposals?taskId=${taskId}&pageSize=50`,
      { signal },
      proposalPageSchema,
    ),
};
