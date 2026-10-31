"use client";
import { useCallback, useEffect, useState } from "react";
import { workflow } from "@/features/work-management/work/tasks/api/workflow";
import type { TaskState } from "@/features/work-management/work/tasks/types";

/** Loads the workflow view of one task: allowed moves, pending proposal, history. */
export function useTaskState(taskId: string | null) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    data: TaskState | null;
    error: string;
    key: string;
  }>({ data: null, error: "", key: "" });
  const key = `${taskId ?? ""}:${revision}`;
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!taskId) return;
    const controller = new AbortController();
    workflow
      .state(taskId, controller.signal)
      .then((data) => setState({ data, error: "", key }))
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          error:
            cause instanceof Error
              ? cause.message
              : "Không tải được trạng thái công việc.",
          key,
        });
      });
    return () => controller.abort();
  }, [taskId, key]);

  const apply = useCallback(
    (next: TaskState) => setState({ data: next, error: "", key }),
    [key],
  );

  return {
    data: state.data,
    error: state.error,
    loading: Boolean(taskId) && state.key !== key,
    reload,
    apply,
  };
}
