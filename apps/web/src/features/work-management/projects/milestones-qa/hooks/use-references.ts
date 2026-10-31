"use client";
import { useEffect, useState } from "react";
import type { Reference } from "@/features/work-management/projects/milestones-qa/types";
import { client } from "@/features/work-management/projects/milestones-qa/api/client";

/**
 * Project and task options for the pickers. Both are read-only references
 * resolved through their public REST list endpoints.
 */
export function useReferences() {
  const [state, setState] = useState<{
    projects: Reference[];
    tasks: Reference[];
    loading: boolean;
    error: string;
  }>({ projects: [], tasks: [], loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      client.projects(controller.signal),
      client.tasks(controller.signal),
    ])
      .then(([projects, tasks]) =>
        setState({ projects, tasks, loading: false, error: "" }),
      )
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            projects: [],
            tasks: [],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Không tải được danh mục dự án và công việc",
          });
      });
    return () => controller.abort();
  }, []);
  return state;
}
