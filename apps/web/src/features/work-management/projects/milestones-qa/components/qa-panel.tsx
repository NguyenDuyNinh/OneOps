"use client";
import { useState } from "react";
import type {
  AcceptanceItem,
  MilestoneTask,
} from "@/features/work-management/projects/milestones-qa/types";
import {
  evidenceSchema,
  QA_OUTCOMES,
  resultInputSchema,
} from "@/features/work-management/projects/milestones-qa/types";
import {
  outcomeLabel,
  outcomeTone,
} from "@/features/work-management/projects/milestones-qa/constants";
import { client } from "@/features/work-management/projects/milestones-qa/api/client";
import { useAcceptance } from "@/features/work-management/projects/milestones-qa/hooks/use-acceptance";
import {
  Modal,
  useWorkspace,
} from "@/features/work-management/projects/milestones-qa/components/primitives/workspace";
import { Button } from "@/features/work-management/projects/milestones-qa/components/primitives/button";
import { Badge } from "@/features/work-management/projects/milestones-qa/components/primitives/foundations";
import {
  Input,
  Select,
} from "@/features/work-management/projects/milestones-qa/components/primitives/forms";
import styles from "@/features/work-management/projects/milestones-qa/components/styles.module.css";

const message = (cause: unknown, fallback: string) =>
  cause instanceof Error ? cause.message : fallback;

/** Acceptance criteria of one task: the QA gate that blocks completion. */
export function QaPanel({
  task,
  onClose,
}: {
  task: MilestoneTask;
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const { data, loading, error, reload } = useAcceptance(task.taskId);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState("");
  const [recordingId, setRecordingId] = useState<string | null>(null);

  async function run(work: () => Promise<void>, done: string) {
    if (pending) return;
    setPending(true);
    setActionError("");
    try {
      await work();
      notify(done);
      reload();
    } catch (cause) {
      setActionError(message(cause, "Không thể lưu kết quả kiểm tra"));
    } finally {
      setPending(false);
    }
  }

  async function addCriterion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const title = String(fields.get("title") || "").trim();
    if (!title) return;
    await run(async () => {
      await client.createAcceptance({
        taskId: task.taskId,
        title,
        steps: String(fields.get("steps") || "").trim(),
        expected: String(fields.get("expected") || "").trim(),
        mandatory: fields.get("mandatory") !== null,
      });
      form.reset();
    }, "Đã thêm tiêu chí kiểm tra.");
  }

  async function record(
    event: React.FormEvent<HTMLFormElement>,
    item: AcceptanceItem,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const label = String(data.get("evidenceLabel") || "").trim();
    const url = String(data.get("evidenceUrl") || "").trim();
    let evidence: { label: string; url: string }[] = [];
    if (label || url) {
      const parsed = evidenceSchema.safeParse({ label, url });
      if (!parsed.success) {
        setActionError(
          parsed.error.issues[0]?.message ??
            "Bằng chứng cần cả nhãn và liên kết hợp lệ.",
        );
        return;
      }
      evidence = [parsed.data];
    }
    const input = resultInputSchema.safeParse({
      outcome: data.get("outcome"),
      note: String(data.get("note") || "").trim(),
      evidence,
    });
    if (!input.success) {
      setActionError(input.error.issues[0]?.message ?? "Dữ liệu chưa hợp lệ.");
      return;
    }
    await run(async () => {
      await client.recordResult(item.id, input.data);
      form.reset();
      setRecordingId(null);
    }, "Đã ghi kết quả kiểm tra.");
  }

  return (
    <Modal
      title={`Kiểm tra · ${task.code}`}
      description={task.name}
      className="max-w-2xl"
      onClose={onClose}
    >
      <div className={styles.details}>
        {loading ? (
          <p role="status">Đang tải tiêu chí kiểm tra…</p>
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
              {!data.gate.required ? (
                <Badge variant="neutral" dot>
                  Chưa có tiêu chí bắt buộc
                </Badge>
              ) : data.gate.passed ? (
                <Badge variant="success" dot>
                  Đủ điều kiện hoàn thành
                </Badge>
              ) : (
                <Badge variant="danger" dot>
                  {data.gate.blocking.length} tiêu chí chưa đạt
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {data.items.length} tiêu chí
              </span>
            </div>

            {!data.items.length ? (
              <p className="text-sm text-muted-foreground">
                Chưa có tiêu chí nào. Thêm tiêu chí để chặn hoàn thành khi chưa
                kiểm tra đạt.
              </p>
            ) : (
              <ul className={styles.criteria}>
                {data.items.map((item) => (
                  <li key={item.id}>
                    <div className={styles.actions}>
                      <strong className="break-words">{item.title}</strong>
                      {item.mandatory && <Badge variant="info">Bắt buộc</Badge>}
                      {item.latestResult ? (
                        <Badge
                          variant={outcomeTone[item.latestResult.outcome]}
                          dot
                        >
                          {outcomeLabel[item.latestResult.outcome]}
                        </Badge>
                      ) : (
                        <Badge variant="neutral" dot>
                          Chưa kiểm tra
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Ghi kết quả ${item.title}`}
                        onClick={() =>
                          setRecordingId(
                            recordingId === item.id ? null : item.id,
                          )
                        }
                      >
                        {recordingId === item.id ? "Đóng" : "Ghi kết quả"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Xóa tiêu chí ${item.title}`}
                        disabled={pending}
                        onClick={() =>
                          void run(async () => {
                            await client.removeAcceptance(item);
                          }, "Đã xóa tiêu chí.")
                        }
                      >
                        Xóa
                      </Button>
                    </div>
                    {item.expected && (
                      <p className={styles.note}>Kỳ vọng: {item.expected}</p>
                    )}
                    {item.steps && (
                      <p className={styles.note}>Các bước: {item.steps}</p>
                    )}
                    {item.latestResult && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.latestResult.testedByName}
                        {item.latestResult.isOverride
                          ? " · ghi đè Quản lý"
                          : ""}
                        {" · "}
                        {new Date(item.latestResult.createdAt).toLocaleString(
                          "vi-VN",
                        )}
                        {item.latestResult.note
                          ? ` · ${item.latestResult.note}`
                          : ""}
                      </p>
                    )}
                    {item.latestResult?.evidence.map((file) => (
                      <a
                        key={file.url}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs text-primary underline-offset-4 hover:underline"
                      >
                        {file.label}
                      </a>
                    ))}
                    {recordingId === item.id && (
                      <form
                        className={styles.formRow}
                        onSubmit={(event) => void record(event, item)}
                      >
                        <label>
                          Kết quả
                          <Select name="outcome" defaultValue="PASS">
                            {QA_OUTCOMES.map((outcome) => (
                              <option key={outcome} value={outcome}>
                                {outcomeLabel[outcome]}
                              </option>
                            ))}
                          </Select>
                        </label>
                        <label>
                          Ghi chú
                          <Input name="note" maxLength={2000} />
                        </label>
                        <label>
                          Nhãn bằng chứng
                          <Input name="evidenceLabel" maxLength={200} />
                        </label>
                        <label>
                          Liên kết bằng chứng
                          <Input
                            name="evidenceUrl"
                            type="url"
                            maxLength={2000}
                          />
                        </label>
                        <Button type="submit" size="sm" loading={pending}>
                          Lưu kết quả
                        </Button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {actionError && (
              <p role="alert" className={styles.error}>
                {actionError}
              </p>
            )}

            <form
              className="form-body"
              onSubmit={(event) => void addCriterion(event)}
            >
              <h3>Thêm tiêu chí</h3>
              <label className="w-full">
                Tiêu chí
                <Input name="title" required maxLength={500} />
              </label>
              <div className={styles.formRow}>
                <label>
                  Kỳ vọng
                  <Input name="expected" maxLength={1000} />
                </label>
                <label>
                  Các bước
                  <Input name="steps" maxLength={2000} />
                </label>
              </div>
              <label className={styles.check}>
                <input type="checkbox" name="mandatory" defaultChecked />
                Bắt buộc để hoàn thành công việc
              </label>
              <Button type="submit" variant="secondary" loading={pending}>
                Thêm tiêu chí
              </Button>
            </form>
          </>
        ) : null}
      </div>
      <footer>
        <Button onClick={onClose}>Đóng</Button>
      </footer>
    </Modal>
  );
}
