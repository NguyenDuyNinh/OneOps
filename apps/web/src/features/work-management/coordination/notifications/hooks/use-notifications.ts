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
    loading: boolean;
    error: string;
    unreadCount: number;
  }>({ records: [], loading: true, error: "", unreadCount: 0 });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    window.addEventListener(event, reload);
    return () => window.removeEventListener(event, reload);
  }, [reload]);
  useEffect(() => {
    const controller = new AbortController();
    client
      .list(recipient, unread, controller.signal)
      .then((result) =>
        setState({
          records: result.items,
          loading: false,
          error: "",
          unreadCount: result.unread,
        }),
      )
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            records: [],
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : "Không tải được thông báo",
            unreadCount: 0,
          });
      });
    return () => controller.abort();
  }, [recipient, unread, revision]);
  return { ...state, reload };
}
