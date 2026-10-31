"use client";
import { useCallback, useEffect, useState } from "react";
import { workflow } from "@/features/work-management/work/tasks/api/workflow";
import {
  proposalInput,
  type ProposalInput,
  type TaskProposal,
} from "@/features/work-management/work/tasks/types";
import {
  proposalLabel,
  proposalStateLabel,
} from "@/features/work-management/work/tasks/constants";
import { Badge } from "@/features/work-management/work/tasks/components/primitives/foundations";
import { Button } from "@/features/work-management/work/tasks/components/primitives/button";
import {
  Input,
  Select,
  Textarea,
} from "@/features/work-management/work/tasks/components/primitives/forms";
import { ReasonDialog } from "@/features/work-management/work/tasks/components/reason-dialog";

const tone: Record<string, "warning" | "success" | "danger" | "neutral"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  AUTO_CLOSED: "neutral",
};

export function TaskProposals({
  taskId,
  status,
  pendingProposal,
  pending,
  onPropose,
  onDecide,
}: {
  taskId: string;
  status: string;
  pendingProposal: TaskProposal | null;
  pending: boolean;
  onPropose: (input: ProposalInput) => Promise<void>;
  onDecide: (
    proposal: TaskProposal,
    decision: "APPROVE" | "REJECT",
    reason?: string,
  ) => Promise<void>;
}) {
  const [items, setItems] = useState<TaskProposal[]>([]);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [kind, setKind] = useState<ProposalInput["kind"]>("HOLD");
  const [reason, setReason] = useState("");
  const [newDate, setNewDate] = useState("");
  const [rejecting, setRejecting] = useState<TaskProposal | null>(null);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    workflow
      .proposals(taskId, controller.signal)
      .then((page) => {
        setItems(page.items);
        setError("");
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error ? cause.message : "Không tải được đề xuất.",
        );
      });
    return () => controller.abort();
  }, [taskId, revision]);

  const closed = status === "Hoàn thành" || status === "Đã hủy";

  return (
    <section aria-label="Đề xuất" className="space-y-3">
      <h3 className="text-sm font-semibold">Đề xuất</h3>
      {pendingProposal && (
        <div className="rounded-control border border-border bg-muted p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">
              {proposalLabel[pendingProposal.kind]} · Chờ duyệt
            </Badge>
            <span className="text-muted-foreground">
              {pendingProposal.requestedByName} ·{" "}
              {new Date(pendingProposal.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words">
            {pendingProposal.reason}
          </p>
          {typeof pendingProposal.payload.newDate === "string" && (
            <p className="mt-1 text-muted-foreground">
              Deadline đề xuất: {pendingProposal.payload.newDate}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={pending}
              onClick={async () => {
                if (pending) return;
                try {
                  await onDecide(pendingProposal, "APPROVE");
                  reload();
                } catch {
                  /* the parent shows the error */
                }
              }}
            >
              Chấp thuận
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => setRejecting(pendingProposal)}
            >
              Từ chối
            </Button>
          </div>
        </div>
      )}
      {!pendingProposal && !closed && (
        <form
          className="space-y-2"
          onSubmit={async (event) => {
            event.preventDefault();
            if (pending) return;
            const parsed = proposalInput.safeParse({
              kind,
              reason,
              newDate: kind === "DEADLINE" ? newDate : undefined,
            });
            if (!parsed.success) {
              setError(parsed.error.issues[0]?.message || "Kiểm tra đề xuất");
              return;
            }
            setError("");
            try {
              await onPropose(parsed.data);
              setReason("");
              setNewDate("");
              reload();
            } catch {
              /* the parent shows the error */
            }
          }}
        >
          <div className="form-grid">
            <label>
              Loại đề xuất
              <Select
                value={kind}
                onChange={(event) =>
                  setKind(event.target.value as ProposalInput["kind"])
                }
              >
                <option value="HOLD">{proposalLabel.HOLD}</option>
                <option value="CANCEL">{proposalLabel.CANCEL}</option>
                <option value="DEADLINE">{proposalLabel.DEADLINE}</option>
              </Select>
            </label>
            {kind === "DEADLINE" && (
              <label>
                Deadline mới
                <Input
                  type="date"
                  value={newDate}
                  required
                  onChange={(event) => setNewDate(event.target.value)}
                />
              </label>
            )}
          </div>
          <label>
            Lý do
            <Textarea
              value={reason}
              rows={2}
              maxLength={2000}
              placeholder="Nêu lý do để Quản lý xem xét (ít nhất 5 ký tự)"
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <Button type="submit" variant="secondary" loading={pending}>
            Gửi đề xuất
          </Button>
        </form>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {items.length > 0 && (
        <ul className="space-y-2 text-sm">
          {items.map((proposal) => (
            <li
              key={proposal.id}
              className="flex flex-wrap items-center gap-2 border-b border-border pb-2 last:border-0"
            >
              <Badge variant={tone[proposal.status] ?? "neutral"}>
                {proposalStateLabel[proposal.status] ?? proposal.status}
              </Badge>
              <span>{proposalLabel[proposal.kind]}</span>
              <span className="text-muted-foreground">
                {proposal.requestedByName} ·{" "}
                {new Date(proposal.createdAt).toLocaleDateString("vi-VN")}
              </span>
              {typeof proposal.payload.newDate === "string" && (
                <span className="text-muted-foreground">
                  Deadline: {proposal.payload.newDate}
                </span>
              )}
              {proposal.decisionReason && (
                <span className="basis-full text-muted-foreground">
                  Phản hồi: {proposal.decisionReason}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {rejecting && (
        <ReasonDialog
          title="Từ chối đề xuất"
          description={`Đề xuất ${proposalLabel[rejecting.kind]} sẽ bị từ chối và người gửi nhận thông báo.`}
          label="Lý do từ chối"
          confirmLabel="Từ chối"
          destructive
          pending={pending}
          onCancel={() => setRejecting(null)}
          onConfirm={async (text) => {
            await onDecide(rejecting, "REJECT", text);
            setRejecting(null);
            reload();
          }}
        />
      )}
    </section>
  );
}
