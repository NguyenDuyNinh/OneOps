"use client";
import { useCallback, useEffect, useState } from "react";
import type { AccountDto } from "@/features/tenant-system/access-control/accounts/types";
import { client } from "@/features/tenant-system/access-control/accounts/api/client";
const event = "oneops-accounts-changed";
export function accountsChanged() {
  window.dispatchEvent(new Event(event));
}
export function useAccounts() {
  const [state, setState] = useState<{
    accounts: AccountDto[];
    loading: boolean;
    error: string;
  }>({ accounts: [], loading: true, error: "" });
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
      .then((accounts) => setState({ accounts, loading: false, error: "" }))
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            accounts: [],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Không tải được danh sách tài khoản",
          });
      });
    return () => controller.abort();
  }, [revision]);
  return { ...state, reload };
}
