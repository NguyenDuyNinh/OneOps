import {
  adjustmentInputSchema,
  decisionInputSchema,
  entryInputSchema,
  periodDetailSchema,
  periodPageSchema,
  type AdjustmentInput,
  type DecisionInput,
  type EntryInput,
  type EntryPatch,
  type PeriodDetail,
  type PeriodDto,
  type TimeEntry,
} from "@/features/work-management/projects/timesheets/types";
import { apiRequest } from "@/features/work-management/projects/timesheets/api/http";

export const client = {
  async list(signal?: AbortSignal) {
    const items: PeriodDto[] = [];
    let page = 1;
    while (true) {
      const result = await apiRequest(
        "/timesheets/periods?page=" + page + "&pageSize=100",
        { signal },
        periodPageSchema,
      );
      items.push(...result.items);
      if (items.length >= result.total || !result.items.length) return items;
      page++;
    }
  },
  /** Opens (or returns) the week; the API never creates a duplicate. */
  open: (weekStart?: string) =>
    apiRequest(
      "/timesheets/periods",
      { method: "POST", body: JSON.stringify(weekStart ? { weekStart } : {}) },
      periodDetailSchema,
    ) as Promise<PeriodDetail>,
  get: (id: string, signal?: AbortSignal) =>
    apiRequest(
      "/timesheets/periods/" + id,
      { signal },
      periodDetailSchema,
    ) as Promise<PeriodDetail>,
  addEntry: (periodId: string, input: EntryInput) =>
    apiRequest(
      "/timesheets/periods/" + periodId + "/entries",
      {
        method: "POST",
        body: JSON.stringify(entryInputSchema.parse(input)),
        // Entry creation is the one repeatable write; retries must be harmless.
        headers: { "Idempotency-Key": crypto.randomUUID() },
      },
      periodDetailSchema,
    ) as Promise<PeriodDetail>,
  updateEntry: (periodId: string, entry: TimeEntry, patch: EntryPatch) =>
    apiRequest(
      "/timesheets/periods/" + periodId + "/entries/" + entry.id,
      {
        method: "PATCH",
        body: JSON.stringify({ ...patch, version: entry.version }),
      },
      periodDetailSchema,
    ) as Promise<PeriodDetail>,
  removeEntry: (periodId: string, entry: TimeEntry) =>
    apiRequest(
      "/timesheets/periods/" + periodId + "/entries/" + entry.id,
      { method: "DELETE", body: JSON.stringify({ version: entry.version }) },
      periodDetailSchema,
    ) as Promise<PeriodDetail>,
  submit: (periodId: string) =>
    apiRequest(
      "/timesheets/periods/" + periodId + "/submit",
      { method: "POST" },
      periodDetailSchema,
    ) as Promise<PeriodDetail>,
  decide: (periodId: string, input: DecisionInput) =>
    apiRequest(
      "/timesheets/periods/" + periodId + "/decision",
      {
        method: "POST",
        body: JSON.stringify(decisionInputSchema.parse(input)),
      },
      periodDetailSchema,
    ) as Promise<PeriodDetail>,
  adjust: (entryId: string, input: AdjustmentInput) =>
    apiRequest(
      "/timesheets/entries/" + entryId + "/adjustments",
      {
        method: "POST",
        body: JSON.stringify(adjustmentInputSchema.parse(input)),
      },
      periodDetailSchema,
    ) as Promise<PeriodDetail>,
};
