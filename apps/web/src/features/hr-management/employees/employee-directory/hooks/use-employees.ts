"use client";
import { useCallback, useEffect, useState } from "react";
import type { EmployeeDto } from "@/features/hr-management/employees/employee-directory/types";
import { client } from "@/features/hr-management/employees/employee-directory/api/client";
const event = "oneops-employees-changed";
export function employeesChanged() {
  window.dispatchEvent(new Event(event));
}
export function useEmployees() {
  const [state, setState] = useState<{
    employees: EmployeeDto[];
    loading: boolean;
    error: string;
  }>({ employees: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    window.addEventListener(event, reload);
    return () => window.removeEventListener(event, reload);
  }, [reload]);
  useEffect(() => {
    const controller = new AbortController();
    client
      .list(controller.signal)
      .then((employees) => setState({ employees, loading: false, error: "" }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            employees: [],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Không tải được danh bạ nhân sự",
          });
      });
    return () => controller.abort();
  }, [revision]);
  return { ...state, reload };
}
