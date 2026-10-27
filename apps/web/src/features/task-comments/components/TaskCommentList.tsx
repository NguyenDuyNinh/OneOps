'use client';

import React, { useState } from 'react';
import { getCurrentUser } from '@/features/auth';
import type { TaskComment } from '../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { TaskLinkPreview } from './TaskLinkPreview';

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
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatFileSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderCommentContent(content: string) {
  // Tách nội dung theo cả @mentions và URLs
  const tokenRegex = /(@[^\s@]+|https?:\/\/[^\s]+)/g;
  const parts = content.split(tokenRegex);
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return (
        <span
          key={index}
          className="inline-block rounded bg-brand-50 px-1 py-0.5 font-semibold text-brand-600 dark:bg-brand-900/30 dark:text-brand-300"
        >
          {part}
        </span>
      );
    }
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-brand-600 underline hover:text-brand-700 dark:text-brand-400"
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
  canReview,
  onApproveProposal,
  onRejectProposal,
}) => {
  const currentUser = getCurrentUser();
  const userIsManager =
    canReview ?? (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER');

  const [rejectingCommentId, setRejectingCommentId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
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
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex animate-pulse items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-10 w-full rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-2 text-3xl">💬</div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Chưa có trao đổi nào trong công việc này
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Hãy bắt đầu trao đổi hoặc gõ &quot;@&quot; để nhắc tên người liên quan
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      {comments.map((comment) => {
        if (comment.isSystemLog) {
          const content = comment.content;
          let icon = '⚙️';
          let badgeText = 'Hệ thống';
          let badgeBg = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
          let borderClass = 'border-gray-200/80 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40';

          if (content.includes('hoãn')) {
            icon = '⏸️';
            badgeText = 'Hoãn công việc';
            badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
            borderClass = 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20';
          } else if (content.includes('hủy') || content.includes('huỷ')) {
            icon = '🚫';
            badgeText = 'Hủy công việc';
            badgeBg = 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
            borderClass = 'border-red-200/80 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20';
          } else if (content.includes('làm lại')) {
            icon = '🔄';
            badgeText = 'Yêu cầu làm lại';
            badgeBg = 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
            borderClass = 'border-purple-200/80 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20';
          } else if (content.includes('giao lại')) {
            icon = '👤';
            badgeText = 'Giao lại công việc';
            badgeBg = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
            borderClass = 'border-blue-200/80 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20';
          } else if (content.includes('chấp thuận đề xuất đổi Deadline')) {
            icon = '✓';
            badgeText = 'Duyệt Deadline';
            badgeBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
            borderClass = 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20';
          } else if (content.includes('từ chối đề xuất đổi Deadline')) {
            icon = '✕';
            badgeText = 'Từ chối Deadline';
            badgeBg = 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
            borderClass = 'border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20';
          }

          // Phân tách phần lý do nếu có: "Lý do: ..."
          const reasonIdx = content.indexOf('Lý do:');
          const mainAction = reasonIdx !== -1 ? content.substring(0, reasonIdx).trim() : content;
          const reasonText = reasonIdx !== -1 ? content.substring(reasonIdx + 'Lý do:'.length).trim() : '';

          return (
            <div
              key={comment.id}
              className={`flex flex-col gap-1 rounded-xl border p-2.5 text-xs transition ${borderClass}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${badgeBg}`}>
                    {badgeText}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {mainAction}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              {reasonText && (
                <div className="mt-1 ml-6 rounded-md bg-white/70 px-2.5 py-1.5 text-gray-700 shadow-xs dark:bg-gray-800/80 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white">Lý do:</span>{' '}
                  <span className="italic">{reasonText}</span>
                </div>
              )}
            </div>
          );
        }

        const authorName = comment.author?.name || 'Thành viên';
        const authorInitial = authorName.charAt(0).toUpperCase();
        const roleLabel =
          comment.author?.role === 'ADMIN'
            ? 'Quản trị viên'
            : comment.author?.role === 'MANAGER'
            ? 'Quản lý'
            : 'Nhân viên';

        const isDeadlineProposal = comment.type === 'DEADLINE_PROPOSAL';
        const isPending = isDeadlineProposal && comment.proposalStatus === 'PENDING';
        const isApproved = isDeadlineProposal && comment.proposalStatus === 'APPROVED';
        const isRejected = isDeadlineProposal && comment.proposalStatus === 'REJECTED';

        return (
          <div key={comment.id} className="flex items-start gap-3 text-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-600 dark:bg-brand-900 dark:text-brand-300">
              {authorInitial}
            </div>

            <div className="flex-1 rounded-2xl rounded-tl-sm bg-gray-50 p-3.5 dark:bg-gray-800/70">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {authorName}
                  </span>
                  <Badge size="sm" variant="light" color="light">
                    {roleLabel}
                  </Badge>
                  {isDeadlineProposal && (
                    <Badge size="sm" variant="solid" color="warning">
                      Đề xuất đổi Deadline
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>

              {/* Nội dung text */}
              <div className="whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
                {renderCommentContent(comment.content)}
              </div>

              {/* Box Đề xuất đổi Deadline */}
              {isDeadlineProposal && comment.proposedDeadline && (
                <div className="mt-3 rounded-xl border border-warning-200 bg-warning-50/70 p-3 text-xs text-warning-900 dark:border-warning-900/60 dark:bg-warning-950/30 dark:text-warning-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                      <span>📅</span>
                      <span>Hạn chót mới đề xuất:</span>
                      <span className="text-brand-600 dark:text-brand-400">
                        {formatDate(comment.proposedDeadline)}
                      </span>
                    </div>

                    <div>
                      {isPending && (
                        <Badge size="sm" variant="solid" color="warning">
                          ⏳ Chờ duyệt
                        </Badge>
                      )}
                      {isApproved && (
                        <Badge size="sm" variant="solid" color="success">
                          ✓ Đã chấp thuận
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge size="sm" variant="solid" color="error">
                          ✕ Đã từ chối
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Lý do từ chối nếu có */}
                  {isRejected && comment.rejectionReason && (
                    <div className="mt-2 rounded-lg bg-red-100/60 p-2 text-red-800 dark:bg-red-950/40 dark:text-red-300">
                      <strong>Lý do từ chối:</strong> {comment.rejectionReason}
                    </div>
                  )}

                  {/* Nút thao tác dành cho Quản lý / Admin khi đề xuất đang PENDING */}
                  {isPending && userIsManager && (
                    <div className="mt-3 border-t border-warning-200/80 pt-2.5 dark:border-warning-900/50">
                      {rejectingCommentId === comment.id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Nhập lý do từ chối đề xuất (bắt buộc)..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="rounded border border-red-300 px-2.5 py-1.5 text-xs text-gray-900 outline-none focus:border-red-500 dark:border-red-700 dark:bg-gray-800 dark:text-white"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isProcessing || !rejectReason.trim()}
                              onClick={() => handleConfirmReject(comment.id)}
                              className="rounded bg-error-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-error-600 disabled:opacity-50"
                            >
                              {isProcessing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingCommentId(null);
                                setRejectReason('');
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            Thao tác Quản lý:
                          </span>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(comment.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-success-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-success-600 disabled:opacity-50"
                          >
                            <span>✓</span>
                            <span>Chấp thuận</span>
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => {
                              setRejectingCommentId(comment.id);
                              setRejectReason('');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-error-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-error-600 disabled:opacity-50"
                          >
                            <span>✕</span>
                            <span>Từ chối</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Khung xem trước tài nguyên (Google Drive, Figma, GitHub...) */}
              {(() => {
                const contentUrls = comment.content.match(/(https?:\/\/[^\s]+)/g) ?? [];
                const allCommentLinks = Array.from(new Set([...(comment.links ?? []), ...contentUrls]));
                if (allCommentLinks.length === 0) return null;

                return (
                  <div className="mt-2.5 space-y-2">
                    {allCommentLinks.map((link, idx) => (
                      <TaskLinkPreview key={`${comment.id}-link-${idx}`} url={link} />
                    ))}
                  </div>
                );
              })()}

              {/* Danh sách tệp đính kèm */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {comment.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >
                      <span>📎</span>
                      <span className="max-w-[200px] truncate font-medium">{att.name}</span>
                      {att.size && (
                        <span className="text-[11px] text-gray-400">
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
    </div>
  );
};
