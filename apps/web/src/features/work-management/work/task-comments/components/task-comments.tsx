"use client";

import React, { useState } from "react";
import type {
  TaskComment,
  CreateCommentPayload,
  CommentType,
  LegacyTaskComment,
} from "../types";
import { TaskCommentsSection } from "./TaskCommentsSection";
import { TaskCommentList } from "./TaskCommentList";
import { TaskCommentInput } from "./TaskCommentInput";
import styles from "./styles.module.css";

export interface TaskCommentsProps {
  taskId?: string;
  comments?: Array<{
    id: string;
    text?: string;
    content?: string;
    author: string | { name: string; role?: string };
    createdAt: string;
    type?: string;
    proposedDeadline?: string | null;
    proposalStatus?: string | null;
    isSystemLog?: boolean;
    links?: string[];
    mentions?: string[];
  }>;
  pending?: boolean;
  onSubmit?: (comment: LegacyTaskComment) => Promise<boolean | unknown>;
}

export function TaskComments({
  taskId,
  comments: propComments,
  pending = false,
  onSubmit,
}: TaskCommentsProps) {
  // Always call hooks at top level unconditionally
  const [localComments, setLocalComments] = useState<TaskComment[]>([]);

  // If a real taskId is provided, use the full backend-driven section
  if (taskId) {
    return (
      <div className={styles.comments}>
        <TaskCommentsSection taskId={taskId} />
      </div>
    );
  }

  // Convert incoming prop comments into rich TaskComment objects
  const normalizedPropComments: TaskComment[] = (propComments || []).map(
    (c) => ({
      id: c.id,
      taskId: taskId || "local",
      authorId: typeof c.author === "string" ? c.author : "author",
      content: c.content || c.text || "",
      text: c.text || c.content || "",
      type: (c.type as CommentType) || "COMMENT",
      mentions: c.mentions || [],
      links: c.links || [],
      proposedDeadline: c.proposedDeadline,
      proposalStatus: c.proposalStatus,
      isSystemLog: Boolean(c.isSystemLog),
      createdAt: c.createdAt,
      author:
        typeof c.author === "string"
          ? { id: "author", name: c.author, role: "STAFF" }
          : {
              id: "author",
              name: c.author.name,
              role: c.author.role || "STAFF",
            },
    }),
  );

  const allComments = [...normalizedPropComments, ...localComments];

  const handleLocalSubmit = async (payload: CreateCommentPayload) => {
    if (onSubmit) {
      const legacyItem: LegacyTaskComment = {
        id: crypto.randomUUID(),
        text: payload.content,
        author: payload.authorName || "Tôi",
        createdAt: new Date().toISOString(),
      };
      await onSubmit(legacyItem);
    } else {
      const newComment: TaskComment = {
        id: crypto.randomUUID(),
        taskId: "local",
        authorId: "usr_me",
        content: payload.content,
        type: payload.type || "COMMENT",
        mentions: payload.mentions || [],
        links: payload.links || [],
        attachments: payload.attachments,
        proposedDeadline: payload.proposedDeadline,
        proposalStatus: payload.type === "DEADLINE_PROPOSAL" ? "PENDING" : null,
        isSystemLog: false,
        createdAt: new Date().toISOString(),
        author: {
          id: "usr_me",
          name: payload.authorName || "Tôi",
          role: "STAFF",
        },
      };
      setLocalComments((prev) => [...prev, newComment]);
    }
  };

  const handleApprove = async (commentId: string) => {
    setLocalComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, proposalStatus: "APPROVED" } : c,
      ),
    );
  };

  const handleReject = async (commentId: string, reason: string) => {
    setLocalComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, proposalStatus: "REJECTED", rejectionReason: reason }
          : c,
      ),
    );
  };

  const hasPendingProposal = allComments.some(
    (c) => c.type === "DEADLINE_PROPOSAL" && c.proposalStatus === "PENDING",
  );

  return (
    <div className={`flex flex-col gap-3 my-3 ${styles.comments || ""}`}>
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="flex items-center gap-2 font-semibold text-foreground text-sm">
          <span>💬</span>
          <span>Trao đổi & Bình luận</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            {allComments.length}
          </span>
        </h3>
        <span className="text-xs text-muted-foreground">
          Gõ @ để nhắc tên đồng nghiệp
        </span>
      </div>

      <div className="max-h-[360px] overflow-y-auto pr-1">
        <TaskCommentList
          comments={allComments}
          isLoading={pending}
          canReview={true}
          onApproveProposal={handleApprove}
          onRejectProposal={handleReject}
        />
      </div>

      <TaskCommentInput
        taskId={taskId || "local"}
        hasPendingProposal={hasPendingProposal}
        onSubmit={handleLocalSubmit}
      />
    </div>
  );
}

export default TaskComments;
