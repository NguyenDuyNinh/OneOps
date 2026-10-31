"use client";
import { useEffect, useState } from "react";
import { client } from "@/features/tenant-system/checklog/api/client";
import { messages } from "@/features/tenant-system/checklog/constants";
import type { AuditEntry } from "@/features/tenant-system/checklog/types";

interface Detail {
  key: string;
  entry: AuditEntry | null;
  error: string;
}

/**
 * Loads one written entry for the detail panel. Entries are immutable, so the
 * result stays keyed by id and reopening the same row needs no second request.
 */
export function useAuditEntry(id: string | null) {
  const [detail, setDetail] = useState<Detail>({
    key: "",
    entry: null,
    error: "",
  });

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const { signal } = controller;
    void (async () => {
      try {
        const entry = await client.entry(id, signal);
        if (signal.aborted) return;
        setDetail({ key: id, entry, error: "" });
      } catch (failure) {
        if (signal.aborted) return;
        setDetail({
          key: id,
          entry: null,
          error: failure instanceof Error ? failure.message : messages.detail,
        });
      }
    })();
    return () => controller.abort();
  }, [id]);

  const settled = Boolean(id) && detail.key === id;
  return {
    entry: settled ? detail.entry : null,
    loading: Boolean(id) && !settled,
    error: settled ? detail.error : "",
  };
}
