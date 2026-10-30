"use client";
import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { client } from "../api/client";
import {
  useNotifications,
  notificationsChanged,
} from "../hooks/use-notifications";
import { Icon } from "./primitives/icon";
import { cn } from "./primitives/utils";
import styles from "./styles.module.css";

const sourceLabels: Record<string, string> = {
  task: "Công việc",
  comment: "Bình luận",
  message: "Tin nhắn",
  meeting: "Cuộc họp",
};

export function ModulePage() {
  const params = useSearchParams();
  const recipient =
    (typeof window !== "undefined"
      ? localStorage.getItem("oneops-user") || ""
      : "") ||
    params.get("recipient") ||
    "";
  const unreadOnly = params.get("unread") === "true";
  const { records, loading, error, unreadCount, reload } = useNotifications(
    recipient,
    unreadOnly ? true : undefined,
  );

  const markRead = useCallback(async (id: string) => {
    try {
      await client.markRead(id);
      notificationsChanged();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!recipient) return;
    try {
      await client.markAllRead(recipient);
      notificationsChanged();
    } catch (e) {
      console.error(e);
    }
  }, [recipient]);

  const removeNotification = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await client.remove(id);
        notificationsChanged();
      } catch (err) {
        console.error(err);
      }
    },
    [],
  );

  if (loading)
    return (
      <div className={styles.root}>
        <p role="status">Đang tải thông báo…</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.root}>
        <p className={styles.error}>{error}</p>
        <button onClick={reload} className={styles.retry}>
          Thử lại
        </button>
      </div>
    );

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1>Thông báo</h1>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount} chưa đọc</span>
        )}
      </div>
      {unreadCount > 0 && (
        <button
          className={styles.markAll}
          onClick={markAllRead}
          disabled={!recipient}
        >
          Đánh dấu tất cả đã đọc
        </button>
      )}
      {!records.length ? (
        <div className={styles.empty}>
          <Icon name="bell" size={32} />
          <p>Chưa có thông báo nào.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {records.map((item) => (
            <li
              key={item.id}
              className={cn(styles.item, item.readAt ? "read" : "unread")}
              onClick={() => {
                if (!item.readAt) void markRead(item.id);
                if (item.link) window.location.assign(item.link);
              }}
            >
              <div className={styles.content}>
                <div className={styles.meta}>
                  <span className={styles.source}>
                    {sourceLabels[item.source] || item.source}
                  </span>
                  <time className={styles.time}>
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </time>
                </div>
                <h3 className={styles.title}>{item.title}</h3>
                {item.body && <p className={styles.body}>{item.body}</p>}
              </div>
              {!item.readAt && (
                <span className={styles.dot} aria-label="Chưa đọc" />
              )}
              <span
                role="button"
                tabIndex={0}
                className={styles.delete}
                aria-label="Xóa thông báo này"
                title="Xóa thông báo này"
                onClick={(e) => void removeNotification(item.id, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    void removeNotification(
                      item.id,
                      e as unknown as React.MouseEvent,
                    );
                  }
                }}
              >
                <Icon name="close" size={16} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
