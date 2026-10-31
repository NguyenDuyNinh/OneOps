"use client";
import { useState } from "react";
import { Modal } from "@/features/work-management/work/tasks/components/primitives/workspace";
import { Button } from "@/features/work-management/work/tasks/components/primitives/button";
import { Textarea } from "@/features/work-management/work/tasks/components/primitives/forms";

/**
 * One prompt for every write the API refuses without a written reason:
 * transitions, proposals, rejections and QA overrides.
 */
export function ReasonDialog({
  title,
  description,
  label,
  confirmLabel,
  required = true,
  destructive,
  pending,
  minLength = 1,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  label: string;
  confirmLabel: string;
  required?: boolean;
  destructive?: boolean;
  pending: boolean;
  minLength?: number;
  onCancel: () => void;
  /** Resolves once the write is stored; a rejection keeps the text on screen. */
  onConfirm: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const busy = pending || submitting;
  const tooShort = required && reason.trim().length < minLength;

  async function submit() {
    if (tooShort) {
      setError(
        minLength > 1
          ? `Nhập lý do ít nhất ${minLength} ký tự`
          : "Nhập lý do trước khi tiếp tục",
      );
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onConfirm(reason.trim());
    } catch (cause) {
      // The dialog stays open, so the written reason is never lost.
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thực hiện được thao tác.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} description={description} onClose={onCancel}>
      <div className="form-body">
        <label>
          {label}
          <Textarea
            value={reason}
            rows={3}
            maxLength={2000}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? "reason-error" : undefined}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        {error && (
          <p className="error" role="alert" id="reason-error">
            {error}
          </p>
        )}
      </div>
      <footer>
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Hủy
        </Button>
        <Button
          variant={destructive ? "destructive" : "primary"}
          loading={busy}
          onClick={() => void submit()}
        >
          {confirmLabel}
        </Button>
      </footer>
    </Modal>
  );
}
