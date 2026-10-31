"use client";
import { useCallback, useEffect, useState } from "react";
import type {
  GradeDto,
  PositionDto,
} from "@/features/hr-management/organization/positions-grades/types";
import { client } from "@/features/hr-management/organization/positions-grades/api/client";
const event = "oneops-positions-changed";
export function positionsChanged() {
  window.dispatchEvent(new Event(event));
}
export function usePositions() {
  const [state, setState] = useState<{
    positions: PositionDto[];
    loading: boolean;
    error: string;
  }>({ positions: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    window.addEventListener(event, reload);
    return () => window.removeEventListener(event, reload);
  }, [reload]);
  useEffect(() => {
    const controller = new AbortController();
    client
      .listPositions(controller.signal)
      .then((positions) => setState({ positions, loading: false, error: "" }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            positions: [],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Không tải được chức danh",
          });
      });
    return () => controller.abort();
  }, [revision]);
  return { ...state, reload };
}
export function useGrades(positionId: string | null) {
  const [state, setState] = useState<{
    loaded: string;
    grades: GradeDto[];
    error: string;
  }>({ loaded: "", grades: [], error: "" });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    window.addEventListener(event, reload);
    return () => window.removeEventListener(event, reload);
  }, [reload]);
  const key = positionId ?? "*";
  useEffect(() => {
    const controller = new AbortController();
    client
      .listGrades(positionId ?? undefined, controller.signal)
      .then((grades) => setState({ loaded: key, grades, error: "" }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            loaded: key,
            grades: [],
            error:
              error instanceof Error ? error.message : "Không tải được cấp bậc",
          });
      });
    return () => controller.abort();
  }, [key, positionId, revision]);
  const current = state.loaded === key;
  return {
    grades: current ? state.grades : [],
    loading: !current,
    error: current ? state.error : "",
    reload,
  };
}
