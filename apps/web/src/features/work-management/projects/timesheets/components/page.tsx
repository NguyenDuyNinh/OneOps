"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PeriodDto } from "@/features/work-management/projects/timesheets/types";
import { PERIOD_STATUSES } from "@/features/work-management/projects/timesheets/types";
import {
  definition,
  formatMinutes,
  statusLabel,
  statusTone,
} from "@/features/work-management/projects/timesheets/constants";
import { usePeriodRecords } from "@/features/work-management/projects/timesheets/hooks/use-records";
import { useWorkspace } from "@/features/work-management/projects/timesheets/components/primitives/workspace";
import { Button } from "@/features/work-management/projects/timesheets/components/primitives/button";
import {
  Input,
  Select,
} from "@/features/work-management/projects/timesheets/components/primitives/forms";
import { Badge } from "@/features/work-management/projects/timesheets/components/primitives/foundations";
import { PeriodDetail } from "@/features/work-management/projects/timesheets/components/period-detail";
import styles from "@/features/work-management/projects/timesheets/components/styles.module.css";

export function ModulePage() {
  const params = useSearchParams();
  const { openCreate } = useWorkspace();
  const { records, loading, error, reload } = usePeriodRecords();
  const [query, setQuery] = useState(params.get("q") || "");
  const [status, setStatus] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);

  const effectiveStatus =
    status === "all" ? "" : status || params.get("status") || "";
  const needle = query.trim().toLocaleLowerCase("vi");
  const filtered = records.filter(
    (record) =>
      (!effectiveStatus || record.status === effectiveStatus) &&
      (!needle ||
        `${record.employeeName} ${record.weekStart} ${record.weekEnd}`
          .toLocaleLowerCase("vi")
          .includes(needle)),
  );
  const open = records.filter(
    (record) => record.status === "OPEN" || record.status === "REJECTED",
  );
  const waiting = records.filter((record) => record.status === "SUBMITTED");
  const approved = records.filter((record) => record.status === "APPROVED");
  const focus = focusId
    ? (records.find((record) => record.id === focusId) ?? null)
    : null;

  return (
    <div className={styles.root}>
      <div className="module-view">
        <section className="records-panel">
          <div className={styles.header}>
            <div>
              <h1>{definition.title}</h1>
              <p>
                Ghi thời gian theo tuần; tuần vượt ngưỡng cần Quản lý duyệt
                trước khi được tính công.
              </p>
            </div>
            <div className={styles.actions}>
              <Button variant="ghost" onClick={reload} loading={loading}>
                Làm mới
              </Button>
              <Button onClick={openCreate}>Mở tuần</Button>
            </div>
          </div>

          <div className={styles.toolbar}>
            <Input
              aria-label="Tìm kiếm tuần công"
              placeholder="Tìm nhân sự hoặc ngày…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Select
              aria-label="Lọc theo trạng thái"
              value={effectiveStatus}
              onChange={(event) => setStatus(event.target.value || "all")}
            >
              <option value="">Tất cả trạng thái</option>
              {PERIOD_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {statusLabel[value]}
                </option>
              ))}
            </Select>
            <span className="text-sm text-muted-foreground">
              {filtered.length} tuần
            </span>
          </div>

          <div className={styles.stats}>
            <Badge variant="neutral" dot>
              {open.length} đang mở
            </Badge>
            <Badge variant={waiting.length ? "warning" : "neutral"} dot>
              {waiting.length} chờ duyệt
            </Badge>
            <Badge variant="success" dot>
              {approved.length} đã duyệt
            </Badge>
          </div>

          {error && (
            <div role="alert" className="error">
              {error}
              <Button variant="ghost" size="sm" onClick={reload}>
                Thử lại
              </Button>
            </div>
          )}

          {loading ? (
            <p role="status">Đang tải dữ liệu…</p>
          ) : !filtered.length ? (
            <div className={styles.empty}>
              <h2>Chưa có tuần công phù hợp</h2>
              <p>Mở tuần hiện tại để bắt đầu ghi thời gian.</p>
              <Button onClick={openCreate}>Mở tuần</Button>
            </div>
          ) : (
            <div className={styles.scroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{definition.personLabel}</th>
                    <th>{definition.dateLabel}</th>
                    <th>Trạng thái</th>
                    <th>Tổng giờ</th>
                    <th>Quyết định</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record: PeriodDto) => (
                    <tr key={record.id}>
                      <td>{record.employeeName}</td>
                      <td>
                        {record.weekStart} → {record.weekEnd}
                      </td>
                      <td>
                        <Badge variant={statusTone[record.status]} dot>
                          {statusLabel[record.status]}
                        </Badge>
                      </td>
                      <td>
                        {formatMinutes(record.totalMinutes)}
                        {record.overThreshold && (
                          <Badge variant="warning" className="ml-2">
                            Vượt ngưỡng
                          </Badge>
                        )}
                      </td>
                      <td className="text-sm text-muted-foreground">
                        {record.decidedByName || "—"}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFocusId(record.id)}
                        >
                          Mở
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {focus && (
        <PeriodDetail
          key={focus.id}
          id={focus.id}
          onClose={() => setFocusId(null)}
        />
      )}
    </div>
  );
}
