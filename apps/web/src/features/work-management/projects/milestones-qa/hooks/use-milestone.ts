"use client";
import { useCallback, useEffect, useState } from "react";
import type { MilestoneDetail } from "@/features/work-management/projects/milestones-qa/types";
import { client } from "@/features/work-management/projects/milestones-qa/api/client";

/** One milestone with its linked tasks; `apply` accepts a fresh server copy. */
export function useMilestone(id: string) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    data: MilestoneDetail | null;
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
          error: error instanceof Error ? error.message : "Không tải được mốc",
          key,
        });
      });
    return () => controller.abort();
  }, [id, key]);

  const apply = useCallback(
    (data: MilestoneDetail) => setState({ data, error: "", key }),
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
