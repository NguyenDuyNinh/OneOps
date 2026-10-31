"use client";
import { useCallback, useEffect, useState } from "react";
import type {
  AcceptanceItem,
  QaGate,
} from "@/features/work-management/projects/milestones-qa/types";
import { client } from "@/features/work-management/projects/milestones-qa/api/client";

type Acceptance = { items: AcceptanceItem[]; gate: QaGate };

/** Acceptance criteria and gate of one task. */
export function useAcceptance(taskId: string) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    data: Acceptance | null;
    error: string;
    key: string;
  }>({ data: null, error: "", key: "" });
  const key = taskId + ":" + revision;
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    client
      .acceptance(taskId, controller.signal)
      .then((data) => setState({ data, error: "", key }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Không tải được tiêu chí kiểm tra",
          key,
        });
      });
    return () => controller.abort();
  }, [taskId, key]);

  return {
    data: state.data,
    error: state.error,
    loading: state.key !== key,
    reload,
  };
}
