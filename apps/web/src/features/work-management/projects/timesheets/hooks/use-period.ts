"use client";
import { useCallback, useEffect, useState } from "react";
import type { PeriodDetail } from "@/features/work-management/projects/timesheets/types";
import { client } from "@/features/work-management/projects/timesheets/api/client";

/** One week with its entries and adjustments; `apply` takes a fresh server copy. */
export function usePeriod(id: string) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    data: PeriodDetail | null;
    error: string;
    key: string;
  }>({ data: null, error: "", key: "" });
  const key = id + ":" + revision;
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    client
      .get(id, controller.signal)
      .then((data) => setState({ data, error: "", key }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          error:
            error instanceof Error ? error.message : "Không tải được tuần công",
          key,
        });
      });
    return () => controller.abort();
  }, [id, key]);

  const apply = useCallback(
    (data: PeriodDetail) => setState({ data, error: "", key }),
    [key],
  );

  return {
    data: state.data,
    error: state.error,
    loading: state.key !== key,
    reload,
    apply,
  };
}
