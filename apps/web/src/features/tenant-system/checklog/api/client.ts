import {
  auditEntrySchema,
  auditFacetsSchema,
  auditPageSchema,
  type ListQuery,
} from "@/features/tenant-system/checklog/types";
import { apiRequest } from "@/features/tenant-system/checklog/api/http";

const base = "/checklog";

/** Only non-empty filters reach the API: the list query schema is strict. */
function search(query: ListQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key === "page" || key === "pageSize" || value === "") continue;
    params.set(key, String(value));
  }
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

export const client = {
  list: (query: ListQuery, signal?: AbortSignal) =>
    apiRequest(`${base}?${search(query)}`, { signal }, auditPageSchema),
  facets: (signal?: AbortSignal) =>
    apiRequest(`${base}/facets`, { signal }, auditFacetsSchema),
  entry: (id: string, signal?: AbortSignal) =>
    apiRequest(`${base}/${id}`, { signal }, auditEntrySchema),
};
