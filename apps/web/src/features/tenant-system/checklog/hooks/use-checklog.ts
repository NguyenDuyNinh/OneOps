"use client";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/features/tenant-system/checklog/api/http";
import { client } from "@/features/tenant-system/checklog/api/client";
import { messages } from "@/features/tenant-system/checklog/constants";
import type {
  AuditEntry,
  AuditFacets,
  ListQuery,
} from "@/features/tenant-system/checklog/types";

export const emptyQuery: ListQuery = {
  q: "",
  feature: "",
  action: "",
  actor: "",
  result: "",
  override: "",
  from: "",
  to: "",
  page: 1,
  pageSize: 25,
};

const emptyFacets: AuditFacets = { features: [], actions: [] };

interface Page {
  key: string;
  items: AuditEntry[];
  total: number;
  denied: boolean;
  error: string;
}

/**
 * Paged audit search. The page is keyed by its query, so `loading` follows from
 * "the answer on screen does not belong to the query yet" instead of a second
 * state that has to be kept in sync. A `403` means the session is valid but the
 * role lacks `view`, so it is reported as a denial rather than an error.
 */
export function useChecklog(initial?: Partial<ListQuery>) {
  const [query, setQuery] = useState<ListQuery>({ ...emptyQuery, ...initial });
  const [search, setSearch] = useState(initial?.q ?? "");
  const [facets, setFacets] = useState<AuditFacets>(emptyFacets);
  const [page, setPage] = useState<Page>({
    key: "",
    items: [],
    total: 0,
    denied: false,
    error: "",
  });
  const [revision, setRevision] = useState(0);
  const key = `${JSON.stringify(query)}|${revision}`;

  // Typing settles into one request instead of one per keystroke.
  useEffect(() => {
    if (search === query.q) return;
    const timer = setTimeout(
      () => setQuery((current) => ({ ...current, q: search, page: 1 })),
      300,
    );
    return () => clearTimeout(timer);
  }, [search, query.q]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void (async () => {
      try {
        const result = await client.list(query, signal);
        if (signal.aborted) return;
        setPage({
          key,
          items: result.items,
          total: result.total,
          denied: false,
          error: "",
        });
      } catch (failure) {
        if (signal.aborted) return;
        setPage({
          key,
          items: [],
          total: 0,
          denied: failure instanceof ApiError && failure.status === 403,
          error: failure instanceof Error ? failure.message : messages.load,
        });
      }
    })();
    return () => controller.abort();
  }, [query, key]);

  useEffect(() => {
    const controller = new AbortController();
    void client
      .facets(controller.signal)
      .then(setFacets)
      .catch(() => setFacets(emptyFacets));
    return () => controller.abort();
  }, [revision]);

  const filter = useCallback((patch: Partial<ListQuery>) => {
    setQuery((current) => ({ ...current, ...patch, page: 1 }));
  }, []);

  const reset = useCallback(() => {
    setSearch("");
    setQuery(emptyQuery);
  }, []);

  const goTo = useCallback((next: number) => {
    setQuery((current) => ({ ...current, page: Math.max(1, next) }));
  }, []);

  const reload = useCallback(() => setRevision((value) => value + 1), []);

  const settled = page.key === key;
  return {
    query,
    search,
    setSearch,
    items: settled ? page.items : [],
    total: page.total,
    facets,
    loading: !settled,
    denied: settled && page.denied,
    error: settled ? page.error : "",
    filter,
    reset,
    goTo,
    reload,
  };
}
