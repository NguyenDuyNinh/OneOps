"use client";
import { Badge } from "@/features/tenant-system/checklog/components/primitives/foundations";
import {
  Dialog,
  DialogContent,
} from "@/features/tenant-system/checklog/components/primitives/overlays";
import {
  actionLabel,
  resultLabels,
  resultVariants,
  roleLabels,
} from "@/features/tenant-system/checklog/constants";
import { useAuditEntry } from "@/features/tenant-system/checklog/hooks/use-audit-entry";

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));

/** Values were already redacted by the sink, so the JSON is safe to show. */
const show = (value: unknown) =>
  value === null || value === undefined
    ? "(không có)"
    : JSON.stringify(value, null, 2);

export function AuditDetail({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const { entry, loading, error } = useAuditEntry(id);
  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        title="Chi tiết bản ghi"
        description={
          entry
            ? `${actionLabel(entry.action)} · ${entry.featureKey}`
            : "Bản ghi nhật ký chỉ được ghi thêm, không sửa hoặc xóa."
        }
      >
        <div className="flex flex-col gap-4 p-6 text-sm">
          {loading && (
            <p role="status" className="text-muted-foreground">
              Đang tải chi tiết…
            </p>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {entry && (
            <>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <dt className="text-muted-foreground">Thời điểm</dt>
                <dd>{formatTime(entry.createdAt)}</dd>
                <dt className="text-muted-foreground">Người thực hiện</dt>
                <dd>
                  {entry.actorName || "—"} ·{" "}
                  {roleLabels[entry.actorRole] ?? entry.actorRole}
                  {entry.isSystemAdmin && (
                    <Badge variant="brand" className="ml-2">
                      Quản trị hệ thống
                    </Badge>
                  )}
                </dd>
                <dt className="text-muted-foreground">Thao tác</dt>
                <dd>
                  {actionLabel(entry.action)}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({entry.action})
                  </span>
                </dd>
                <dt className="text-muted-foreground">Đối tượng</dt>
                <dd className="break-all">
                  {entry.targetType || "—"}
                  {entry.targetId ? ` · ${entry.targetId}` : ""}
                </dd>
                <dt className="text-muted-foreground">Kết quả</dt>
                <dd>
                  <Badge variant={resultVariants[entry.result]} dot>
                    {resultLabels[entry.result]}
                  </Badge>
                  {entry.isOutOfScopeOverride && (
                    <Badge variant="warning" className="ml-2">
                      Ngoài phạm vi
                    </Badge>
                  )}
                </dd>
                <dt className="text-muted-foreground">Mã bản ghi</dt>
                <dd className="break-all font-mono text-xs">{entry.id}</dd>
              </dl>
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  Nội dung
                </h3>
                <p>{entry.summary}</p>
              </section>
              {entry.reason && (
                <section>
                  <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Lý do
                  </h3>
                  <p>{entry.reason}</p>
                </section>
              )}
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  Giá trị trước
                </h3>
                <pre className="overflow-auto rounded-control border border-border bg-muted p-3 font-mono text-xs">
                  {show(entry.before)}
                </pre>
              </section>
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  Giá trị sau
                </h3>
                <pre className="overflow-auto rounded-control border border-border bg-muted p-3 font-mono text-xs">
                  {show(entry.after)}
                </pre>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
