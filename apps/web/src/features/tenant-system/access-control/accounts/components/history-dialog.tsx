"use client";
import { useEffect, useState } from "react";
import type {
  AccessChange,
  AccountDto,
} from "@/features/tenant-system/access-control/accounts/types";
import { client } from "@/features/tenant-system/access-control/accounts/api/client";
import { changeKindLabels } from "@/features/tenant-system/access-control/accounts/constants";
import { Button } from "@/features/tenant-system/access-control/accounts/components/primitives/button";
export function HistoryDialog({
  record,
  onClose,
}: {
  record: AccountDto;
  onClose: () => void;
}) {
  const [items, setItems] = useState<AccessChange[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    client
      .history(record, controller.signal)
      .then((result) => setItems(result.items))
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Không tải được lịch sử quyền",
          );
      });
    return () => controller.abort();
  }, [record]);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Lịch sử thay đổi vai trò, quyền quản trị, trạng thái và mật khẩu của tài
        khoản {record.username}.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {items === null && !error ? (
        <p role="status" className="text-sm text-muted-foreground">
          Đang tải lịch sử…
        </p>
      ) : items && items.length ? (
        <ol className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-panel border border-border bg-surface p-3 text-sm"
            >
              <p className="font-medium">
                {changeKindLabels[item.kind]}
                {item.fromValue || item.toValue
                  ? `: ${item.fromValue || "—"} → ${item.toValue || "—"}`
                  : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.actorName}
                {item.reason ? ` · ${item.reason}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Intl.DateTimeFormat("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(item.createdAt))}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">
          Chưa có thay đổi quyền nào được ghi nhận.
        </p>
      )}
      <footer className="flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </footer>
    </div>
  );
}
