"use client";
import { useState } from "react";
import type {
  MilestoneDto,
  MilestoneStatus,
  MilestoneTask,
  Reference,
} from "@/features/work-management/projects/milestones-qa/types";
import { MILESTONE_MOVES } from "@/features/work-management/projects/milestones-qa/types";
import {
  moveLabel,
  progressOf,
  statusLabel,
  statusTone,
} from "@/features/work-management/projects/milestones-qa/constants";
import { client } from "@/features/work-management/projects/milestones-qa/api/client";
import { useMilestone } from "@/features/work-management/projects/milestones-qa/hooks/use-milestone";
import { recordsChanged } from "@/features/work-management/projects/milestones-qa/hooks/use-records";
import {
  Modal,
  useWorkspace,
} from "@/features/work-management/projects/milestones-qa/components/primitives/workspace";
import { Button } from "@/features/work-management/projects/milestones-qa/components/primitives/button";
import { Badge } from "@/features/work-management/projects/milestones-qa/components/primitives/foundations";
import { Select } from "@/features/work-management/projects/milestones-qa/components/primitives/forms";
import { QaPanel } from "@/features/work-management/projects/milestones-qa/components/qa-panel";
import styles from "@/features/work-management/projects/milestones-qa/components/styles.module.css";

export function MilestoneDetail({
  id,
  projects,
  tasks,
  onClose,
  onEdit,
  onCancel,
}: {
  id: string;
  projects: readonly Reference[];
  tasks: readonly Reference[];
  onClose: () => void;
  onEdit: (milestone: MilestoneDto) => void;
  onCancel: (milestone: MilestoneDto) => void;
}) {
  const { notify } = useWorkspace();
  const { data, loading, error, reload, apply } = useMilestone(id);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState("");
  const [linkId, setLinkId] = useState("");
  const [qaTask, setQaTask] = useState<MilestoneTask | null>(null);

  async function run(work: () => Promise<void>, done: string) {
    if (pending) return;
    setPending(true);
    setActionError("");
    try {
      await work();
      recordsChanged();
      notify(done);
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : "Không thể cập nhật mốc",
      );
    } finally {
      setPending(false);
    }
  }

  const linked = new Set(data?.items.map((item) => item.taskId) ?? []);
  const available = tasks.filter((task) => !linked.has(task.id));
  const project = projects.find((item) => item.id === data?.projectId);
  const progress = data ? progressOf(data) : 0;
  const canCancel = Boolean(
    data && MILESTONE_MOVES[data.status].includes("CANCELLED"),
  );

  return (
    <Modal
      title={data?.name ?? "Mốc"}
      description={
        data ? `${statusLabel[data.status]} · ${data.targetDate}` : undefined
      }
      className="max-w-3xl"
      onClose={onClose}
    >
      <div className={styles.details}>
        {loading && !data ? (
          <p role="status">Đang tải mốc…</p>
        ) : error ? (
          <div role="alert" className="error">
            {error}
            <Button variant="ghost" size="sm" onClick={reload}>
              Thử lại
            </Button>
          </div>
        ) : data ? (
          <>
            <div className={styles.actions}>
              <Badge variant={statusTone[data.status]} dot>
                {statusLabel[data.status]}
              </Badge>
              {data.overdue && <Badge variant="danger">Trễ hạn</Badge>}
              <Badge variant="neutral">
                {data.completedCount}/{data.itemCount} công việc
              </Badge>
            </div>

            <div>
              <div className={styles.progress} aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {progress}% công việc đã hoàn thành
              </p>
            </div>

            <dl className={styles.meta}>
              <div>
                <dt>Dự án</dt>
                <dd>
                  {project
                    ? `${project.code} · ${project.name}`
                    : data.projectId}
                </dd>
              </div>
              <div>
                <dt>Ngày đích</dt>
                <dd className={data.overdue ? "text-destructive" : undefined}>
                  {data.targetDate}
                </dd>
              </div>
              <div>
                <dt>Tham chiếu hợp đồng</dt>
                <dd>{data.contractRef || "Chưa có"}</dd>
              </div>
            </dl>

            <p className={styles.note}>
              {data.description || "Chưa có mô tả."}
            </p>

            <section aria-label="Chuyển trạng thái">
              <h3>Chuyển trạng thái</h3>
              {MILESTONE_MOVES[data.status].length ? (
                <div className={styles.actions}>
                  {MILESTONE_MOVES[data.status].map((next: MilestoneStatus) => (
                    <Button
                      key={next}
                      variant="secondary"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        void run(async () => {
                          await client.update(data, { status: next });
                          reload();
                        }, `Đã chuyển mốc sang ${statusLabel[next]}.`)
                      }
                    >
                      {moveLabel[next]}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Mốc đã kết thúc, không thể chuyển trạng thái.
                </p>
              )}
            </section>

            {actionError && (
              <p role="alert" className={styles.error}>
                {actionError}
              </p>
            )}

            <section aria-label="Công việc trong mốc">
              <h3>Công việc trong mốc ({data.items.length})</h3>
              {data.items.length ? (
                <ul className={styles.tasks}>
                  {data.items.map((item) => (
                    <li key={item.taskId}>
                      <div>
                        <strong>{item.code}</strong> {item.name}
                        <span className="text-xs text-muted-foreground">
                          {" "}
                          · {item.status}
                        </span>
                      </div>
                      <div className={styles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Kiểm tra ${item.code}`}
                          onClick={() => setQaTask(item)}
                        >
                          Kiểm tra
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Bỏ liên kết ${item.code}`}
                          disabled={pending}
                          onClick={() =>
                            void run(async () => {
                              apply(await client.unlink(id, item.taskId));
                            }, "Đã bỏ liên kết công việc.")
                          }
                        >
                          Bỏ liên kết
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có công việc nào được gắn vào mốc này.
                </p>
              )}
              <form
                className={styles.formRow}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!linkId) return;
                  void run(async () => {
                    apply(await client.link(id, [linkId]));
                    setLinkId("");
                  }, "Đã liên kết công việc.");
                }}
              >
                <label>
                  Gắn công việc
                  <Select
                    value={linkId}
                    onChange={(event) => setLinkId(event.target.value)}
                  >
                    <option value="">Chọn công việc…</option>
                    {available.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.code} · {task.name}
                      </option>
                    ))}
                  </Select>
                </label>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={!linkId || pending}
                >
                  Liên kết
                </Button>
              </form>
            </section>
          </>
        ) : null}
      </div>
      <footer>
        <Button
          variant="ghost"
          disabled={!data || pending || !canCancel}
          onClick={() => data && onCancel(data)}
        >
          Hủy mốc
        </Button>
        <Button
          variant="secondary"
          disabled={!data || pending}
          onClick={() => data && onEdit(data)}
        >
          Chỉnh sửa
        </Button>
        <Button onClick={onClose}>Đóng</Button>
      </footer>
      {qaTask && <QaPanel task={qaTask} onClose={() => setQaTask(null)} />}
    </Modal>
  );
}
