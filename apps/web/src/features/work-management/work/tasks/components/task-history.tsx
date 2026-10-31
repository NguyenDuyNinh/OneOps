"use client";
import type { TaskTransition } from "@/features/work-management/work/tasks/types";
import { transitionLabel } from "@/features/work-management/work/tasks/constants";
import { Badge } from "@/features/work-management/work/tasks/components/primitives/foundations";

export function TaskHistory({ items }: { items: readonly TaskTransition[] }) {
  if (!items.length)
    return (
      <p className="text-sm text-muted-foreground">
        Chưa có lần chuyển trạng thái nào.
      </p>
    );
  return (
    <ol className="space-y-3 text-sm" aria-label="Lịch sử trạng thái">
      {items.map((item) => (
        <li key={item.id} className="border-l-2 border-border pl-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">{item.code}</Badge>
            <strong>{transitionLabel[item.code] ?? item.toStatus}</strong>
            <span className="text-muted-foreground">
              {item.fromStatus} → {item.toStatus}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {item.actorName} ·{" "}
            {new Date(item.occurredAt).toLocaleString("vi-VN")}
          </p>
          {item.reason && (
            <p className="mt-1 whitespace-pre-wrap break-words">
              {item.reason}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
