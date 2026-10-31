"use client";
import { useCallback, useEffect, useState } from "react";
import { workflow } from "@/features/work-management/work/tasks/api/workflow";
import type { AllowedEntry } from "@/features/work-management/work/tasks/types";

export type AllowedMap = ReadonlyMap<string, AllowedEntry>;

const empty: AllowedMap = new Map();

/**
 * The board only offers moves the API would accept for this actor, so a drag
 * never ends in a rejection the user cannot explain.
 */
export function useAllowed(taskIds: readonly string[]) {
  const ids = taskIds.join(",");
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    map: AllowedMap;
    error: string;
    key: string;
  }>({ map: empty, error: "", key: "" });
  const key = `${ids}:${revision}`;
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!ids) return;
    const controller = new AbortController();
    workflow
      .allowed(ids.split(","), controller.signal)
      .then((items) =>
        setState({
          map: new Map(items.map((entry) => [entry.taskId, entry])),
          error: "",
          key,
        }),
      )
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setState({
          map: empty,
          error:
            cause instanceof Error
              ? cause.message
              : "Không tải được quyền chuyển trạng thái.",
          key,
        });
      });
    return () => controller.abort();
  }, [ids, key]);

  return {
    map: state.map,
    error: state.error,
    loading: Boolean(ids) && state.key !== key,
    reload,
  };
}
