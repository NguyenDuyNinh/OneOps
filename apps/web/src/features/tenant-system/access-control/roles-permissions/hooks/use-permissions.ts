"use client";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/features/tenant-system/access-control/roles-permissions/api/http";
import { client } from "@/features/tenant-system/access-control/roles-permissions/api/client";
import { messages } from "@/features/tenant-system/access-control/roles-permissions/constants";
import type {
  Matrix,
  MyPermissions,
  PermissionChange,
} from "@/features/tenant-system/access-control/roles-permissions/types";

/**
 * Loads the signed-in actor first: a role without `view` on this feature gets a
 * `403` from the matrix route, which is shown as a clear denial instead of an
 * error, because the session itself is still valid.
 */
export function usePermissions() {
  const [state, setState] = useState<{
    me: MyPermissions | null;
    matrix: Matrix | null;
    history: PermissionChange[];
    loading: boolean;
    denied: boolean;
    error: string;
  }>({
    me: null,
    matrix: null,
    history: [],
    loading: true,
    denied: false,
    error: "",
  });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    void (async () => {
      try {
        const me = await client.mine(signal);
        const matrix = await client.matrix(signal).catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 403) return null;
          throw error;
        });
        const history = matrix
          ? await client
              .history(signal)
              .catch(() => ({ items: [] as PermissionChange[] }))
          : { items: [] as PermissionChange[] };
        if (signal.aborted) return;
        setState({
          me,
          matrix,
          history: history.items,
          loading: false,
          denied: !matrix,
          error: "",
        });
      } catch (error) {
        if (signal.aborted) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : messages.load,
        }));
      }
    })();
    return () => controller.abort();
  }, [revision]);
  const apply = useCallback((matrix: Matrix) => {
    setState((current) => ({ ...current, matrix, denied: false }));
  }, []);
  return { ...state, reload, apply };
}
