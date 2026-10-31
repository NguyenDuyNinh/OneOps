"use client";
import { useState } from "react";
import type {
  PeriodDetail as Period,
  TimeEntry,
} from "@/features/work-management/projects/timesheets/types";
import {
  DAY_LIMIT_MINUTES,
  DAY_THRESHOLD_MINUTES,
  MINUTE_STEP,
  decisionInputSchema,
} from "@/features/work-management/projects/timesheets/types";
import {
  dayTotals,
  formatDay,
  formatMinutes,
  isEditable,
  statusLabel,
  statusTone,
} from "@/features/work-management/projects/timesheets/constants";
import { client } from "@/features/work-management/projects/timesheets/api/client";
import { usePeriod } from "@/features/work-management/projects/timesheets/hooks/use-period";
import { recordsChanged } from "@/features/work-management/projects/timesheets/hooks/use-records";
import {
  Modal,
  useWorkspace,
} from "@/features/work-management/projects/timesheets/components/primitives/workspace";
import { Button } from "@/features/work-management/projects/timesheets/components/primitives/button";
import { Badge } from "@/features/work-management/projects/timesheets/components/primitives/foundations";
import {
  Input,
  Select,
  Textarea,
} from "@/features/work-management/projects/timesheets/components/primitives/forms";
import styles from "@/features/work-management/projects/timesheets/components/styles.module.css";

const minuteOptions = Array.from(
  { length: DAY_LIMIT_MINUTES / MINUTE_STEP },
  (_, index) => (index + 1) * MINUTE_STEP,
);

export function PeriodDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { notify } = useWorkspace();
  const { data, loading, error, reload, apply } = usePeriod(id);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [deciding, setDeciding] = useState(false);
  const [decisionNote, setDecisionNote] = useState("");

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
        cause instanceof Error ? cause.message : "Không thể cập nhật tuần công",
      );
    } finally {
      setPending(false);
    }
  }

  async function addEntry(
    event: React.FormEvent<HTMLFormElement>,
    period: Period,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    await run(async () => {
      apply(
        await client.addEntry(period.id, {
          workDate: String(fields.get("workDate") || ""),
          minutes: Number(fields.get("minutes") || 0),
          note: String(fields.get("note") || "").trim(),
          billable: fields.get("billable") !== null,
        }),
      );
      form.reset();
    }, "Đã thêm dòng thời gian.");
  }

  async function saveEntry(
    event: React.FormEvent<HTMLFormElement>,
    period: Period,
    entry: TimeEntry,
  ) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    await run(async () => {
      apply(
        await client.updateEntry(period.id, entry, {
          workDate: String(fields.get("workDate") || entry.workDate),
          minutes: Number(fields.get("minutes") || entry.minutes),
          note: String(fields.get("note") || "").trim(),
          billable: fields.get("billable") !== null,
        }),
      );
      setEditingId(null);
    }, "Đã cập nhật dòng thời gian.");
  }

  async function adjust(
    event: React.FormEvent<HTMLFormElement>,
    period: Period,
    entry: TimeEntry,
  ) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    await run(async () => {
      apply(
        await client.adjust(entry.id, {
          deltaMinutes: Number(fields.get("deltaMinutes") || 0),
          note: String(fields.get("note") || "").trim(),
        }),
      );
      setAdjustingId(null);
    }, "Đã ghi điều chỉnh.");
  }

  /** A rejection needs a written reason; the same rule the API enforces. */
  async function decideWith(period: Period, decision: "APPROVE" | "REJECT") {
    const parsed = decisionInputSchema.safeParse({
      decision,
      note: decisionNote.trim(),
    });
    if (!parsed.success) {
      setActionError(
        parsed.error.issues[0]?.message ?? "Kiểm tra lại ghi chú quyết định.",
      );
      return;
    }
    await run(
      async () => {
        apply(await client.decide(period.id, parsed.data));
        setDeciding(false);
        setDecisionNote("");
      },
      decision === "APPROVE" ? "Đã duyệt tuần công." : "Đã từ chối tuần công.",
    );
  }

  const editable = data ? isEditable(data.status) : false;
  const totals = data ? dayTotals(data.entries) : new Map<string, number>();
  const heavyDays = [...totals.entries()].filter(
    ([, minutes]) => minutes > DAY_THRESHOLD_MINUTES,
  );
  const entries = data
    ? [...data.entries].sort((left, right) =>
        left.workDate.localeCompare(right.workDate),
      )
    : [];

  return (
    <Modal
      title={data ? `Tuần ${data.weekStart} → ${data.weekEnd}` : "Tuần công"}
      description={
        data ? `${data.employeeName} · ${statusLabel[data.status]}` : undefined
      }
      className="max-w-3xl"
      onClose={onClose}
    >
      <div className={styles.details}>
        {loading && !data ? (
          <p role="status">Đang tải tuần công…</p>
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
              <Badge variant="brand">{formatMinutes(data.totalMinutes)}</Badge>
              {data.overThreshold && (
                <Badge variant="warning">Vượt ngưỡng · cần Quản lý duyệt</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {entries.length} dòng thời gian
              </span>
            </div>

            {data.decidedByName && (
              <p className="text-sm text-muted-foreground">
                {data.status === "REJECTED" ? "Từ chối" : "Duyệt"} bởi{" "}
                {data.decidedByName}
                {data.decidedAt
                  ? ` · ${new Date(data.decidedAt).toLocaleString("vi-VN")}`
                  : ""}
                {data.decisionNote ? ` · ${data.decisionNote}` : ""}
              </p>
            )}

            {heavyDays.length > 0 && (
              <p className="text-sm text-warning">
                Ngày vượt {formatMinutes(DAY_THRESHOLD_MINUTES)}:{" "}
                {heavyDays
                  .map(
                    ([day, minutes]) =>
                      `${formatDay(day)} ${formatMinutes(minutes)}`,
                  )
                  .join(", ")}
                . Tuần này cần Quản lý duyệt.
              </p>
            )}

            {editable && (
              <form
                className={styles.formRow}
                onSubmit={(event) => void addEntry(event, data)}
              >
                <label>
                  Ngày
                  <Input
                    name="workDate"
                    type="date"
                    required
                    defaultValue={data.weekStart}
                    min={data.weekStart}
                    max={data.weekEnd}
                  />
                </label>
                <label>
                  Thời lượng
                  <Select name="minutes" defaultValue="480">
                    {minuteOptions.map((minutes) => (
                      <option key={minutes} value={minutes}>
                        {formatMinutes(minutes)}
                      </option>
                    ))}
                  </Select>
                </label>
                <label>
                  Ghi chú
                  <Input name="note" maxLength={1000} />
                </label>
                <label className={styles.check}>
                  <input type="checkbox" name="billable" />
                  Tính phí
                </label>
                <Button type="submit" loading={pending}>
                  Thêm dòng
                </Button>
              </form>
            )}

            {actionError && (
              <p role="alert" className={styles.error}>
                {actionError}
              </p>
            )}

            {entries.length ? (
              <ul className={styles.entries}>
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <div className={styles.entryRow}>
                      <strong className={styles.day}>
                        {formatDay(entry.workDate)}
                      </strong>
                      <span>{formatMinutes(entry.minutes)}</span>
                      {entry.billable && <Badge variant="info">Tính phí</Badge>}
                      <span className={styles.entryNote}>
                        {entry.note || "Không có ghi chú"}
                      </span>
                      <span className={styles.actions}>
                        {editable && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Sửa dòng ${entry.workDate}`}
                              onClick={() =>
                                setEditingId(
                                  editingId === entry.id ? null : entry.id,
                                )
                              }
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Xóa dòng ${entry.workDate}`}
                              disabled={pending}
                              onClick={() =>
                                void run(async () => {
                                  apply(
                                    await client.removeEntry(data.id, entry),
                                  );
                                }, "Đã xóa dòng thời gian.")
                              }
                            >
                              Xóa
                            </Button>
                          </>
                        )}
                        {data.status === "APPROVED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Điều chỉnh dòng ${entry.workDate}`}
                            onClick={() =>
                              setAdjustingId(
                                adjustingId === entry.id ? null : entry.id,
                              )
                            }
                          >
                            Điều chỉnh
                          </Button>
                        )}
                      </span>
                    </div>
                    {editingId === entry.id && (
                      <form
                        className={styles.formRow}
                        onSubmit={(event) => void saveEntry(event, data, entry)}
                      >
                        <label>
                          Ngày
                          <Input
                            name="workDate"
                            type="date"
                            defaultValue={entry.workDate}
                            min={data.weekStart}
                            max={data.weekEnd}
                          />
                        </label>
                        <label>
                          Thời lượng
                          <Select
                            name="minutes"
                            defaultValue={String(entry.minutes)}
                          >
                            {minuteOptions.map((minutes) => (
                              <option key={minutes} value={minutes}>
                                {formatMinutes(minutes)}
                              </option>
                            ))}
                          </Select>
                        </label>
                        <label>
                          Ghi chú
                          <Textarea
                            name="note"
                            maxLength={1000}
                            defaultValue={entry.note}
                          />
                        </label>
                        <label className={styles.check}>
                          <input
                            type="checkbox"
                            name="billable"
                            defaultChecked={entry.billable}
                          />
                          Tính phí
                        </label>
                        <Button type="submit" size="sm" loading={pending}>
                          Lưu
                        </Button>
                      </form>
                    )}
                    {adjustingId === entry.id && (
                      <form
                        className={styles.formRow}
                        onSubmit={(event) => void adjust(event, data, entry)}
                      >
                        <label>
                          Điều chỉnh (phút)
                          <Input
                            name="deltaMinutes"
                            type="number"
                            step={MINUTE_STEP}
                            min={-DAY_LIMIT_MINUTES}
                            max={DAY_LIMIT_MINUTES}
                            required
                          />
                        </label>
                        <label>
                          Lý do
                          <Input name="note" required maxLength={1000} />
                        </label>
                        <Button type="submit" size="sm" loading={pending}>
                          Ghi điều chỉnh
                        </Button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tuần này chưa có dòng thời gian nào.
              </p>
            )}

            {data.adjustments.length > 0 && (
              <section aria-label="Điều chỉnh sau duyệt">
                <h3>Điều chỉnh sau duyệt</h3>
                <ul className={styles.entries}>
                  {data.adjustments.map((row) => (
                    <li key={row.id} className={styles.entryRow}>
                      <span>{formatMinutes(row.deltaMinutes)}</span>
                      <span className={styles.entryNote}>{row.note}</span>
                      <span className="text-xs text-muted-foreground">
                        {row.adjustedByName}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {editable && (
              <section aria-label="Gửi duyệt">
                <h3>Gửi duyệt</h3>
                <p className="text-sm text-muted-foreground">
                  Tuần trong ngưỡng được tự động duyệt; tuần vượt ngưỡng chuyển
                  sang Quản lý.
                </p>
                <Button
                  className="mt-2"
                  loading={pending}
                  disabled={!entries.length}
                  onClick={() =>
                    void run(async () => {
                      apply(await client.submit(data.id));
                    }, "Đã gửi tuần công.")
                  }
                >
                  Gửi tuần này
                </Button>
              </section>
            )}

            {data.status === "SUBMITTED" && (
              <section aria-label="Quyết định duyệt">
                <h3>Duyệt tuần công</h3>
                {deciding ? (
                  <>
                    <Textarea
                      aria-label="Ghi chú quyết định"
                      maxLength={1000}
                      placeholder="Ghi chú (bắt buộc khi từ chối)"
                      value={decisionNote}
                      onChange={(event) => setDecisionNote(event.target.value)}
                    />
                    <div className={styles.actions}>
                      <Button
                        loading={pending}
                        onClick={() => void decideWith(data, "APPROVE")}
                      >
                        Duyệt
                      </Button>
                      <Button
                        variant="destructive"
                        loading={pending}
                        onClick={() => void decideWith(data, "REJECT")}
                      >
                        Từ chối
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setDeciding(false)}
                        disabled={pending}
                      >
                        Hủy
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button variant="secondary" onClick={() => setDeciding(true)}>
                    Xử lý quyết định
                  </Button>
                )}
              </section>
            )}
          </>
        ) : null}
      </div>
      <footer>
        <Button onClick={onClose}>Đóng</Button>
      </footer>
    </Modal>
  );
}
