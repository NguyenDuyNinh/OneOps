"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { client } from "@/features/work-management/coordination/workspace-today/api/client";
import {
  useModuleRecords,
  recordsChanged,
} from "@/features/work-management/coordination/workspace-today/hooks/use-records";
import { useWorkspace } from "@/features/work-management/coordination/workspace-today/components/primitives/workspace";
import { Button } from "@/features/work-management/coordination/workspace-today/components/primitives/button";
import styles from "@/features/work-management/coordination/workspace-today/components/styles.module.css";
export function ModulePage() {
  const [summary, setSummary] = useState<Awaited<
      ReturnType<typeof client.summary>
    > | null>(null),
    [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const { records } = useModuleRecords();
  const { openCreate } = useWorkspace();
  useEffect(() => {
    const controller = new AbortController();
    client
      .summary(controller.signal)
      .then((value) => {
        setSummary(value);
        setError("");
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Không tải được tổng quan");
      });
    return () => controller.abort();
  }, [revision]);
  return (
    <div className={styles.root}>
      <div className="module-view">
        <section className="records-panel">
          <div className={styles.header}>
            <div>
              <h1>Không gian làm việc</h1>
              <p>Một nơi cho công việc, đội nhóm và những điều quan trọng.</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setRevision((value) => value + 1)}
            >
              Làm mới
            </Button>
          </div>
          <div className={styles.quick}>
            <Link href="/work-management/tasks">Theo dõi công việc →</Link>
            <Link href="/work-management/projects">Dự án →</Link>
            <Link href="/work-management/calendar">Lịch làm việc →</Link>
            <Link href="/work-management/internal-chat">Trao đổi nhóm →</Link>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className={styles.summary}>
            {[
              ["Tổng công việc", summary?.totalTasks],
              [
                "Đang chờ hoàn thành",
                summary
                  ? summary.totalTasks - summary.completedTasks
                  : undefined,
              ],
              ["Quá hạn", summary?.overdueTasks],
              ["Dự án", summary?.projects],
              ["Đề xuất chờ duyệt", summary?.pendingRequests],
              ["Lịch hôm nay", summary?.todayEvents],
            ].map(([label, value]) => (
              <div className={styles.metric} key={label}>
                <span>{label}</span>
                <strong>{value ?? "—"}</strong>
              </div>
            ))}
          </div>
          <div className={styles.grid}>
            <section className={styles.card}>
              <div className={styles.header}>
                <h2 className="text-lg font-semibold">
                  Công việc cần quan tâm
                </h2>
                <Link
                  href="/work-management/tasks"
                  className="text-primary text-sm"
                >
                  Xem tất cả
                </Link>
              </div>
              {!summary?.tasks.length ? (
                <p className="text-muted-foreground">
                  Chưa có công việc đang mở. Bắt đầu bằng việc tạo công việc đầu
                  tiên.
                </p>
              ) : (
                summary.tasks.map((task) => (
                  <Link
                    href={
                      "/work-management/tasks?q=" +
                      encodeURIComponent(task.name)
                    }
                    key={task.id}
                    className="block border-b border-border py-3"
                  >
                    <strong className="text-sm">{task.name}</strong>
                    <div className={styles.meta}>
                      <span>{task.assignee || "Chưa phân công"}</span>
                      <span>
                        {task.status} · {task.date}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </section>
            <section className={styles.card}>
              <div className={styles.header}>
                <h2 className="text-lg font-semibold">Góc làm việc của tôi</h2>
                <Button size="sm" variant="ghost" onClick={openCreate}>
                  Thêm tiện ích
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Ghim các liên kết hữu ích để truy cập nhanh.
              </p>
              {records
                .filter((record) => record.status === "Đang dùng")
                .map((record) => (
                  <div
                    className="flex items-center justify-between gap-2 border-b border-border py-3"
                    key={record.id}
                  >
                    <a
                      href={record.fields.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary"
                    >
                      {record.name}
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await client.remove(record);
                          recordsChanged();
                        } catch (e) {
                          setError(
                            e instanceof Error
                              ? e.message
                              : "Không thể bỏ ghim",
                          );
                        }
                      }}
                    >
                      Bỏ ghim
                    </Button>
                  </div>
                ))}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
