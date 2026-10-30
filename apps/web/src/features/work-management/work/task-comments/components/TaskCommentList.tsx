"use client";

import React, { useState } from "react";
import type { TaskComment } from "../types";
import { Badge } from "./primitives/badge";
import { Button } from "./primitives/button";
import { Modal } from "./primitives/modal";
import { TaskLinkPreview } from "./TaskLinkPreview";

interface TaskCommentListProps {
  comments: TaskComment[];
  isLoading?: boolean;
  canReview?: boolean;
  onApproveProposal?: (commentId: string) => Promise<unknown>;
  onRejectProposal?: (commentId: string, reason: string) => Promise<unknown>;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderCommentContent(content: string) {
  const tokenRegex = /(@[^\s@]+|https?:\/\/[^\s]+)/g;
  const parts = content.split(tokenRegex);
  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      return (
        <span
          key={index}
          className="inline-block rounded bg-primary/10 px-1 py-0.5 font-semibold text-primary"
        >
          {part}
        </span>
      );
    }
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-primary underline hover:opacity-80"
        >
          <span>{part}</span>
          <span className="text-[10px]">↗</span>
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export const TaskCommentList: React.FC<TaskCommentListProps> = ({
  comments,
  isLoading,
  canReview = true,
  onApproveProposal,
  onRejectProposal,
}) => {
  const [rejectingCommentId, setRejectingCommentId] = useState<string | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleApprove = async (commentId: string) => {
    if (!onApproveProposal) return;
    try {
      setIsProcessing(true);
      await onApproveProposal(commentId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async (commentId: string) => {
    if (!onRejectProposal || !rejectReason.trim()) return;
    try {
      setIsProcessing(true);
      await onRejectProposal(commentId, rejectReason.trim());
      setRejectingCommentId(null);
      setRejectReason("");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/4 rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <span className="text-3xl mb-1">💬</span>
        <p className="text-xs">Chưa có bình luận nào cho công việc này.</p>
        <p className="text-[11px] text-muted-foreground/80 mt-0.5">
          Gõ @ để nhắc tên đồng nghiệp hoặc đề xuất đổi Deadline khi cần.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 py-1">
      {comments.map((comment) => {
        const isProposal = comment.type === "DEADLINE_PROPOSAL";
        const isPending = comment.proposalStatus === "PENDING";
        const isApproved = comment.proposalStatus === "APPROVED";
        const isRejected = comment.proposalStatus === "REJECTED";
        const authorName = comment.author?.name || "Người dùng";
        const authorRole = comment.author?.role;

        // SYSTEM LOG STYLE
        if (comment.isSystemLog) {
          return (
            <div
              key={comment.id}
              className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground"
            >
              <span className="text-sm">🔔</span>
              <span className="flex-1 italic">{comment.content}</span>
              <span className="text-[10px] shrink-0 opacity-70">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          );
        }

        // PROPOSAL CARD STYLE
        if (isProposal) {
          return (
            <div
              key={comment.id}
              className={`rounded-xl border p-3.5 transition shadow-sm ${
                isPending
                  ? "border-amber-300 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20"
                  : isApproved
                    ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                    : "border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/20"
              }`}
            >
              {/* Proposal Header */}
              <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
                    ⏱
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">
                        {authorName}
                      </span>
                      {authorRole && (
                        <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                          {authorRole}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {isPending && (
                    <Badge color="warning" size="sm">
                      Chờ duyệt
                    </Badge>
                  )}
                  {isApproved && (
                    <Badge color="success" size="sm">
                      Đã chấp thuận
                    </Badge>
                  )}
                  {isRejected && (
                    <Badge color="error" size="sm">
                      Đã từ chối
                    </Badge>
                  )}
                </div>
              </div>

              {/* Proposed Deadline */}
              {comment.proposedDeadline && (
                <div className="my-2.5 flex items-center gap-2 rounded-lg bg-card/80 p-2 text-xs">
                  <span className="font-semibold text-foreground">
                    Thời hạn đề xuất mới:
                  </span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">
                    {formatDate(comment.proposedDeadline)}
                  </span>
                </div>
              )}

              {/* Reason / Content */}
              <div className="text-xs text-foreground/90 whitespace-pre-wrap">
                <span className="font-semibold text-muted-foreground">
                  Lý do:{" "}
                </span>
                {renderCommentContent(comment.content)}
              </div>

              {/* Rejection Reason if any */}
              {isRejected && comment.rejectionReason && (
                <div className="mt-2 rounded-lg bg-red-100/60 p-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300">
                  <span className="font-bold">Lý do từ chối: </span>
                  {comment.rejectionReason}
                </div>
              )}

              {/* Review Actions for Managers / Admins */}
              {isPending && canReview && (
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/50 pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setRejectingCommentId(comment.id)}
                    disabled={isProcessing}
                  >
                    Từ chối
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleApprove(comment.id)}
                    disabled={isProcessing}
                    loading={isProcessing}
                  >
                    Chấp thuận
                  </Button>
                </div>
              )}
            </div>
          );
        }

        // REGULAR COMMENT STYLE
        return (
          <div
            key={comment.id}
            className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card p-3 shadow-sm transition hover:border-border"
          >
            {/* Avatar */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {authorName.charAt(0).toUpperCase()}
            </div>

            {/* Comment Body */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-foreground">
                    {authorName}
                  </span>
                  {authorRole && (
                    <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                      {authorRole}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              {/* Content */}
              <div className="mt-1 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {renderCommentContent(comment.content || comment.text || "")}
              </div>

              {/* Link Previews */}
              {comment.links && comment.links.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {comment.links.map((link, idx) => (
                    <TaskLinkPreview key={idx} url={link} />
                  ))}
                </div>
              )}

              {/* Attachments */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {comment.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs text-foreground transition hover:bg-muted"
                    >
                      <span>📎</span>
                      <span className="truncate max-w-[160px] font-medium">
                        {att.name}
                      </span>
                      {att.size && (
                        <span className="text-[10px] text-muted-foreground">
                          ({formatFileSize(att.size)})
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Rejection Modal */}
      {rejectingCommentId && (
        <Modal
          isOpen={Boolean(rejectingCommentId)}
          onClose={() => {
            setRejectingCommentId(null);
            setRejectReason("");
          }}
          className="max-w-md p-5"
        >
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Từ chối đề xuất đổi Deadline
            </h3>
            <p className="text-xs text-muted-foreground">
              Vui lòng nhập lý do từ chối để nhân sự nắm bắt và tiếp tục xử lý
              công việc.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={3}
              className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRejectingCommentId(null);
                  setRejectReason("");
                }}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!rejectReason.trim() || isProcessing}
                loading={isProcessing}
                onClick={() => handleConfirmReject(rejectingCommentId)}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
