"use client";
import { useEffect, useState } from "react";
import { client } from "@/features/work-management/coordination/workspace-today/reports/api/client";
import styles from "@/features/work-management/coordination/workspace-today/reports/components/styles.module.css";
export function WorkspaceMetrics() {
  const [summary, setSummary] = useState<Awaited<
      ReturnType<typeof client.summary>
    > | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    client
      .summary(controller.signal)
      .then(setSummary)
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error ? error.message : "Không tải được báo cáo",
          );
      });
    return () => controller.abort();
  }, []);
  if (error)
    return (
      <p className="error" role="alert">
        {error}
      </p>
    );
  if (!summary) return <p>Đang tổng hợp dữ liệu…</p>;
  return (
    <div className={styles.summary}>
      {[
        ["Tổng công việc", summary.totalTasks],
        ["Hoàn thành", summary.completedTasks],
        ["Quá hạn", summary.overdueTasks],
        ["Tỷ lệ hoàn thành", summary.completionRate + "%"],
        ["Dự án", summary.projects],
        ["Đề xuất chờ duyệt", summary.pendingRequests],
      ].map(([label, value]) => (
        <div className={styles.metric} key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
