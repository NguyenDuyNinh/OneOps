"use client";
import { useCallback, useEffect, useState } from "react";
import type { DepartmentDto } from "@/features/hr-management/organization/departments-teams/types";
import { client } from "@/features/hr-management/organization/departments-teams/api/client";
const event = "oneops-organization-changed";
export function organizationChanged() {
  window.dispatchEvent(new Event(event));
}
export function useOrganization() {
  const [state, setState] = useState<{
    departments: DepartmentDto[];
    loading: boolean;
    error: string;
  }>({ departments: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    window.addEventListener(event, reload);
    return () => window.removeEventListener(event, reload);
  }, [reload]);
  useEffect(() => {
    const controller = new AbortController();
    client
      .listDepartments(controller.signal)
      .then((departments) =>
        setState({ departments, loading: false, error: "" }),
      )
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            departments: [],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Không tải được cơ cấu tổ chức",
          });
      });
    return () => controller.abort();
  }, [revision]);
  return { ...state, reload };
}
export function useTeams(departmentId: string) {
  const [state, setState] = useState<{
    loaded: string;
    teams: Awaited<ReturnType<typeof client.listTeams>>;
    error: string;
  }>({ loaded: "", teams: [], error: "" });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    window.addEventListener(event, reload);
    return () => window.removeEventListener(event, reload);
  }, [reload]);
  useEffect(() => {
    if (!departmentId) return;
    const controller = new AbortController();
    client
      .listTeams(departmentId, controller.signal)
      .then((teams) => setState({ loaded: departmentId, teams, error: "" }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            loaded: departmentId,
            teams: [],
            error:
              error instanceof Error ? error.message : "Không tải được nhóm",
          });
      });
    return () => controller.abort();
  }, [departmentId, revision]);
  const current = state.loaded === departmentId;
  return {
    teams: current ? state.teams : [],
    loading: Boolean(departmentId) && !current,
    error: current ? state.error : "",
    reload,
  };
}
