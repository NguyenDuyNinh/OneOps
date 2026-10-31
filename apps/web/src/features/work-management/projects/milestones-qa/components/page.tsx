"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { MilestoneDto } from "@/features/work-management/projects/milestones-qa/types";
import {
  MILESTONE_STATUSES,
  TERMINAL_STATUSES,
} from "@/features/work-management/projects/milestones-qa/types";
import {
  definition,
  progressOf,
  statusLabel,
  statusTone,
} from "@/features/work-management/projects/milestones-qa/constants";
import { client } from "@/features/work-management/projects/milestones-qa/api/client";
import {
  recordsChanged,
  useModuleRecords,
} from "@/features/work-management/projects/milestones-qa/hooks/use-records";
import { useReferences } from "@/features/work-management/projects/milestones-qa/hooks/use-references";
import {
  Modal,
  useWorkspace,
} from "@/features/work-management/projects/milestones-qa/components/primitives/workspace";
import { Button } from "@/features/work-management/projects/milestones-qa/components/primitives/button";
import {
  Input,
  Select,
} from "@/features/work-management/projects/milestones-qa/components/primitives/forms";
import { Badge } from "@/features/work-management/projects/milestones-qa/components/primitives/foundations";
import { RecordForm } from "@/features/work-management/projects/milestones-qa/components/record-form";
import { MilestoneDetail } from "@/features/work-management/projects/milestones-qa/components/milestone-detail";
import styles from "@/features/work-management/projects/milestones-qa/components/styles.module.css";

export function ModulePage() {
  const params = useSearchParams();
  const { openCreate, notify } = useWorkspace();
  const { records, loading, error, reload } = useModuleRecords();
  const references = useReferences();
  const [query, setQuery] = useState(params.get("q") || "");
  const [status, setStatus] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [editing, setEditing] = useState<MilestoneDto | null>(null);
  const [cancelling, setCancelling] = useState<MilestoneDto | null>(null);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState("");

  const effectiveStatus =
    status === "all" ? "" : status || params.get("status") || "";
  const needle = query.trim().toLocaleLowerCase("vi");
  const projects = new Map(
    references.projects.map((project) => [project.id, project]),
  );
  const filtered = records.filter((record) => {
    const project = projects.get(record.projectId);
    const haystack = [
      record.name,
      record.description,
      record.contractRef,
      project?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("vi");
    return (
      (!effectiveStatus || record.status === effectiveStatus) &&
      (!needle || haystack.includes(needle))
    );
  });
  const open = records.filter(
    (record) => !TERMINAL_STATUSES.includes(record.status),
  );
  const overdue = records.filter((record) => record.overdue);
  const completed = records.filter((record) => record.status === "COMPLETED");

  return (
    <div className={styles.root}>
      <div className="module-view">
        <section className="records-panel">
          <div className={styles.header}>
            <div>
              <h1>{definition.title}</h1>
              <p>
                Theo dõi mốc bàn giao và tiêu chí kiểm tra trước khi công việc
                được xác nhận hoàn thành.
              </p>
            </div>
            <div className={styles.actions}>
              <Button variant="ghost" onClick={reload} loading={loading}>
                Làm mới
              </Button>
              <Button onClick={openCreate}>Tạo mốc</Button>
            </div>
          </div>

          <div className={styles.toolbar}>
            <Input
              aria-label="Tìm kiếm mốc"
              placeholder="Tìm mốc, dự án, hợp đồng…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Select
              aria-label="Lọc theo trạng thái"
              value={effectiveStatus}
              onChange={(event) => setStatus(event.target.value || "all")}
            >
              <option value="">Tất cả trạng thái</option>
              {MILESTONE_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {statusLabel[value]}
                </option>
              ))}
            </Select>
            <span className="text-sm text-muted-foreground">
              {filtered.length} mốc
            </span>
          </div>

          <div className={styles.stats}>
            <Badge variant="neutral" dot>
              {open.length} đang mở
            </Badge>
            <Badge variant={overdue.length ? "danger" : "neutral"} dot>
              {overdue.length} trễ hạn
            </Badge>
            <Badge variant="success" dot>
              {completed.length} hoàn thành
            </Badge>
          </div>

          {references.error && (
            <p className="text-sm text-muted-foreground">
              Không tải được danh mục dự án: {references.error}
            </p>
          )}
          {(error || actionError) && (
            <div role="alert" className="error">
              {error || actionError}
              <Button variant="ghost" size="sm" onClick={reload}>
                Thử lại
              </Button>
            </div>
          )}

          {loading ? (
            <p role="status">Đang tải dữ liệu…</p>
          ) : !filtered.length ? (
            <div className={styles.empty}>
              <h2>Chưa có mốc phù hợp</h2>
              <p>Tạo mốc đầu tiên hoặc thay đổi điều kiện tìm kiếm.</p>
              <Button onClick={openCreate}>Tạo mốc</Button>
            </div>
          ) : (
            <ul className={styles.grid}>
              {filtered.map((record) => {
                const project = projects.get(record.projectId);
                const progress = progressOf(record);
                return (
                  <li key={record.id}>
                    <button
                      className={styles.card}
                      onClick={() => setFocusId(record.id)}
                    >
                      <span className={styles.cardHead}>
                        <strong>{record.name}</strong>
                        <Badge variant={statusTone[record.status]} dot>
                          {statusLabel[record.status]}
                        </Badge>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {project
                          ? `${project.code} · ${project.name}`
                          : "Dự án không xác định"}
                      </span>
                      <span className={styles.progress}>
                        <span style={{ width: `${progress}%` }} />
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {record.completedCount}/{record.itemCount} công việc
                        </span>
                        <span
                          className={
                            record.overdue ? "text-destructive" : undefined
                          }
                        >
                          · {definition.dateLabel} {record.targetDate}
                        </span>
                        {record.contractRef && (
                          <span>· {record.contractRef}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {focusId && (
        <MilestoneDetail
          key={focusId}
          id={focusId}
          projects={references.projects}
          tasks={references.tasks}
          onClose={() => setFocusId(null)}
          onEdit={(milestone) => {
            setEditing(milestone);
            setFocusId(null);
          }}
          onCancel={(milestone) => {
            setCancelling(milestone);
            setFocusId(null);
          }}
        />
      )}
      {editing && (
        <Modal title="Chỉnh sửa mốc" onClose={() => setEditing(null)}>
          <RecordForm
            record={editing}
            projects={references.projects}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
      {cancelling && (
        <Modal title="Hủy mốc" onClose={() => setCancelling(null)}>
          <div className="form-body">
            <p>
              Bạn muốn hủy mốc “{cancelling.name}”? Các công việc và tiêu chí
              kiểm tra đã gắn vẫn được giữ lại nhưng mốc không còn hiệu lực.
            </p>
            {actionError && (
              <p className="error" role="alert">
                {actionError}
              </p>
            )}
          </div>
          <footer>
            <Button variant="secondary" onClick={() => setCancelling(null)}>
              Giữ mốc
            </Button>
            <Button
              variant="destructive"
              loading={pending}
              onClick={async () => {
                if (pending) return;
                setPending(true);
                setActionError("");
                try {
                  await client.update(cancelling, { status: "CANCELLED" });
                  recordsChanged();
                  setCancelling(null);
                  notify("Đã hủy mốc.");
                } catch (cause) {
                  setActionError(
                    cause instanceof Error
                      ? cause.message
                      : "Không thể hủy mốc",
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              Hủy mốc
            </Button>
          </footer>
        </Modal>
      )}
    </div>
  );
}
