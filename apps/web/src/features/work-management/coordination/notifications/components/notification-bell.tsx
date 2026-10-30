"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { RecordDto } from "../types";
import { client } from "../api/client";
import { notificationsChanged } from "../hooks/use-notifications";
import { Icon } from "./primitives/icon";
import { cn } from "./primitives/utils";
import styles from "./notification-bell.module.css";

const sourceAvatarStyles: Record<string, string> = {
  task: styles.avatarTask,
  comment: styles.avatarComment,
  message: styles.avatarMessage,
  meeting: styles.avatarMeeting,
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export function NotificationBell() {
  const router = useRouter();

  // Khởi tạo recipient từ local storage hoặc mặc định là Lan
  const [recipient] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("oneops-user");
      if (stored) return stored;
      localStorage.setItem("oneops-user", "Lan");
    }
    return "Lan";
  });

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentList, setRecentList] = useState<RecordDto[]>([]);
  const [isRinging, setIsRinging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Tải danh sách thông báo và cập nhật khi có event thay đổi
  const fetchNotifications = useCallback(() => {
    if (!recipient) return;
    client
      .list(recipient)
      .then((res) => {
        setRecentList(res.items.slice(0, 10));
        setUnreadCount(res.unread);
      })
      .catch((err) => {
        console.error("Không thể tải thông báo:", err);
      });
  }, [recipient]);

  useEffect(() => {
    fetchNotifications();
    window.addEventListener("oneops-notifications-changed", fetchNotifications);
    return () => {
      window.removeEventListener(
        "oneops-notifications-changed",
        fetchNotifications,
      );
    };
  }, [fetchNotifications]);

  // Kết nối Server-Sent Events (SSE) để nhận thông báo realtime
  useEffect(() => {
    if (!recipient || typeof window === "undefined") return;
    const streamUrl = `/api/v1/notifications/stream?recipient=${encodeURIComponent(recipient)}`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(streamUrl);

      // Nhận thông báo mới
      eventSource.addEventListener("notification", (event) => {
        try {
          const newNotif: RecordDto = JSON.parse(event.data);
          setRecentList((prev) =>
            [newNotif, ...prev.filter((item) => item.id !== newNotif.id)].slice(
              0,
              10,
            ),
          );
          setUnreadCount((prev) => prev + 1);

          // Kích hoạt hiệu ứng chuông rung lắc
          setIsRinging(true);
          setTimeout(() => setIsRinging(false), 2400);

          // Phát thông báo đồng bộ sang các trang khác
          notificationsChanged();
        } catch (err) {
          console.error("Lỗi parse SSE notification:", err);
        }
      });

      // Nhận sự kiện thông báo bị xóa (do thực thể liên kết bị xóa)
      eventSource.addEventListener("notification_deleted", (event) => {
        try {
          const { id } = JSON.parse(event.data);
          setRecentList((prev) => prev.filter((item) => item.id !== id));
          fetchNotifications();
          notificationsChanged();
        } catch (err) {
          console.error("Lỗi parse SSE notification_deleted:", err);
        }
      });
    } catch (e) {
      console.error("Không thể khởi tạo SSE stream:", e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [recipient, fetchNotifications]);

  // Đóng dropdown khi click ra ngoài hoặc bấm Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Đánh dấu 1 thông báo đã đọc và chuyển hướng đến trang đích
  const handleItemClick = async (item: RecordDto) => {
    if (!item.readAt) {
      try {
        await client.markRead(item.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setRecentList((prev) =>
          prev.map((n) =>
            n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n,
          ),
        );
        notificationsChanged();
      } catch (err) {
        console.error("Lỗi đánh dấu đã đọc:", err);
      }
    }
    setIsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllRead = async () => {
    if (!recipient) return;
    try {
      await client.markAllRead(recipient);
      setUnreadCount(0);
      setRecentList((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() })),
      );
      notificationsChanged();
    } catch (err) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", err);
    }
  };

  // Xóa trực tiếp 1 thông báo
  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await client.remove(id);
      setRecentList((prev) => prev.filter((item) => item.id !== id));
      fetchNotifications();
      notificationsChanged();
    } catch (err) {
      console.error("Lỗi xóa thông báo:", err);
    }
  };

  // Lọc danh sách theo Tab "Tất cả" hoặc "Chưa đọc"
  const displayedList = recentList.filter((item) =>
    filter === "unread" ? !item.readAt : true,
  );

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Icon chuông tròn trên Header */}
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          styles.bellButton,
          isOpen && styles.active,
          isRinging && styles.ringing,
        )}
        aria-label="Thông báo"
        aria-expanded={isOpen}
        title="Thông báo"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Icon name="bell" size={20} />
        {unreadCount > 0 && (
          <>
            <span className={styles.badgePulse} aria-hidden="true" />
            <span
              className={styles.badge}
              aria-label={`${unreadCount} thông báo chưa đọc`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Popover danh sách thông báo */}
      {isOpen && (
        <div
          className={styles.dropdown}
          role="dialog"
          aria-label="Menu thông báo"
        >
          {/* Header */}
          <div className={styles.dropdownHeader}>
            <div className={styles.headerTop}>
              <h2 className={styles.title}>Thông báo</h2>
              <div className={styles.headerActions}>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className={styles.markAllTextBtn}
                    onClick={handleMarkAllRead}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs: Tất cả / Chưa đọc */}
            <div className={styles.filterTabs}>
              <button
                type="button"
                className={cn(
                  styles.filterPill,
                  filter === "all" && styles.activePill,
                )}
                onClick={() => setFilter("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={cn(
                  styles.filterPill,
                  filter === "unread" && styles.activePill,
                )}
                onClick={() => setFilter("unread")}
              >
                Chưa đọc
                {unreadCount > 0 && (
                  <span className={styles.filterCount}>{unreadCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Danh sách thông báo */}
          <ul className={styles.itemsList}>
            {displayedList.length === 0 ? (
              <li className={styles.emptyState}>
                <div className={styles.emptyIconCircle}>
                  <Icon name="bell" size={28} />
                </div>
                <p className={styles.emptyText}>
                  {filter === "unread"
                    ? "Bạn không có thông báo chưa đọc nào."
                    : "Chưa có thông báo nào."}
                </p>
              </li>
            ) : (
              displayedList.map((item) => {
                const iconName =
                  item.source === "comment"
                    ? "comment"
                    : item.source === "message"
                      ? "message"
                      : item.source === "meeting"
                        ? "meeting"
                        : "task";

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={cn(
                        styles.item,
                        !item.readAt && styles.unreadItem,
                      )}
                      onClick={() => void handleItemClick(item)}
                    >
                      {/* Avatar icon theo loại thông báo */}
                      <div className={styles.avatarWrap}>
                        <div
                          className={cn(
                            styles.avatarCircle,
                            sourceAvatarStyles[item.source] ||
                              styles.avatarTask,
                          )}
                        >
                          <Icon name={iconName} size={20} />
                        </div>
                      </div>

                      {/* Nội dung thông báo */}
                      <div className={styles.itemText}>
                        <div className={styles.itemTitle}>{item.title}</div>
                        {item.body && (
                          <p className={styles.itemBody}>{item.body}</p>
                        )}
                        <div
                          className={cn(
                            styles.itemTime,
                            !item.readAt && styles.unreadTime,
                          )}
                        >
                          {formatRelativeTime(item.createdAt)}
                        </div>
                      </div>

                      {/* Chấm tròn báo chưa đọc */}
                      {!item.readAt && (
                        <span className={styles.unreadDot} aria-hidden="true" />
                      )}

                      {/* Nút xóa nhanh thông báo */}
                      <span
                        role="button"
                        tabIndex={0}
                        className={styles.deleteBtn}
                        aria-label="Xóa thông báo này"
                        title="Xóa thông báo này"
                        onClick={(e) => void handleDeleteItem(e, item.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            void handleDeleteItem(
                              e as unknown as React.MouseEvent,
                              item.id,
                            );
                          }
                        }}
                      >
                        <Icon name="close" size={14} />
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer xem tất cả */}
          <div className={styles.dropdownFooter}>
            <Link
              href="/work-management/notifications"
              className={styles.seeAllLink}
              onClick={() => setIsOpen(false)}
            >
              <span>Xem tất cả trong Thông báo</span>
              <Icon name="chevron" size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
