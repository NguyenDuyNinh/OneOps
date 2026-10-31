"use client";
import { useEffect, useState, useCallback } from "react";
import type { RecordDto } from "../types";
import { client } from "../api/client";
const event = "oneops-notifications-changed";
export function notificationsChanged() {
  window.dispatchEvent(new Event(event));
}
export function useNotifications(recipient: string, unread?: boolean) {
  const [state, setState] = useState<{
    records: RecordDto[];
    error: string;
    unreadCount: number;
    key: string;
  }>({ records: [], error: "", unreadCount: 0, key: "" });
  const [revision, setRevision] = useState(0);
  const key = `${recipient}:${unread === undefined ? "all" : String(unread)}:${revision}`;
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    window.addEventListener(event, reload);
    return () => window.removeEventListener(event, reload);
  }, [reload]);
  useEffect(() => {
    if (!recipient) return;
    const controller = new AbortController();
    client
      .list(recipient, unread, controller.signal)
      .then((result) =>
        setState({
          records: result.items,
          error: "",
          unreadCount: result.unread,
          key,
        }),
      )
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({
          records: [],
          error:
            error instanceof Error ? error.message : "Không tải được thông báo",
          unreadCount: 0,
          key,
        });
      });
    return () => controller.abort();
  }, [recipient, unread, key]);
  return {
    records: state.records,
    error: state.error,
    unreadCount: state.unreadCount,
    loading: Boolean(recipient) && state.key !== key,
    reload,
  };
}
