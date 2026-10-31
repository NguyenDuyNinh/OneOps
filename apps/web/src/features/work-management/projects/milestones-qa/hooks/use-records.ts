"use client";
import { useEffect, useState, useCallback } from "react";
import type { MilestoneDto } from "@/features/work-management/projects/milestones-qa/types";
import { client } from "@/features/work-management/projects/milestones-qa/api/client";

const event = "oneops-milestones-changed";

/** Any screen that changed a milestone can ask every other screen to refetch. */
export function recordsChanged() {
  window.dispatchEvent(new Event(event));
}

export function useModuleRecords() {
  const [state, setState] = useState<{
    records: MilestoneDto[];
    loading: boolean;
    error: string;
  }>({ records: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    window.addEventListener(event, reload);
    return () => window.removeEventListener(event, reload);
  }, [reload]);
  // Coming back to the tab revalidates so a teammate's change shows up.
  useEffect(() => {
    const revalidate = () => {
      if (document.visibilityState === "visible") reload();
    };
    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    return () => {
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
    };
  }, [reload]);
  useEffect(() => {
    const controller = new AbortController();
    client
      .list(controller.signal)
      .then((records) => setState({ records, loading: false, error: "" }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            records: [],
            loading: false,
            error:
              error instanceof Error ? error.message : "Không tải được dữ liệu",
          });
      });
    return () => controller.abort();
  }, [revision]);
  return { ...state, reload };
}
