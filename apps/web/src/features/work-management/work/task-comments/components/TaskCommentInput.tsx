"use client";

import React, { useRef, useState } from "react";
import { useMentionableUsers } from "../hooks/useMentionableUsers";
import type {
  CreateCommentPayload,
  MentionableUser,
  TaskCommentAttachment,
} from "../types";
import { Button } from "./primitives/button";
import { TaskLinkPreview } from "./TaskLinkPreview";

interface TaskCommentInputProps {
  taskId: string;
  hasPendingProposal?: boolean;
  onSubmit: (payload: CreateCommentPayload) => Promise<unknown>;
}

export const TaskCommentInput: React.FC<TaskCommentInputProps> = ({
  hasPendingProposal = false,
  onSubmit,
}) => {
  const { users } = useMentionableUsers();
  const [mode, setMode] = useState<"COMMENT" | "DEADLINE_PROPOSAL">("COMMENT");
  const [content, setContent] = useState("");
  const [proposedDeadline, setProposedDeadline] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<TaskCommentAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionCursorPos, setMentionCursorPos] = useState<number>(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [minDateTime] = useState(() =>
    new Date(Date.now() + 60000).toISOString().slice(0, 16),
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const pos = e.target.selectionStart;
    setContent(text);

    const beforeCursor = text.substring(0, pos);
    const lastAtIdx = beforeCursor.lastIndexOf("@");

    if (lastAtIdx !== -1) {
      const charBeforeAt = lastAtIdx > 0 ? beforeCursor[lastAtIdx - 1] : " ";
      if (charBeforeAt === " " || charBeforeAt === "\n") {
        const query = beforeCursor.substring(lastAtIdx + 1);
        if (!query.includes(" ")) {
          setMentionQuery(query.toLowerCase());
          setMentionCursorPos(lastAtIdx);
          setShowMentionMenu(true);
          return;
        }
      }
    }

    setShowMentionMenu(false);
  };

  const handleSelectMention = (user: MentionableUser) => {
    const beforeAt = content.substring(0, mentionCursorPos);
    const afterQuery = content.substring(
      textareaRef.current?.selectionStart || content.length,
    );
    const newText = `${beforeAt}@${user.name} ${afterQuery}`;

    setContent(newText);
    if (!mentions.includes(user.id)) {
      setMentions((prev) => [...prev, user.id]);
    }
    setShowMentionMenu(false);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = beforeAt.length + user.name.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 50);
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    let url = newLinkUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    setLinks((prev) => Array.from(new Set([...prev, url])));
    setNewLinkUrl("");
    setShowLinkInput(false);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = pastedText.match(urlRegex);
    if (matches && matches.length > 0) {
      setLinks((prev) => Array.from(new Set([...prev, ...matches])));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: TaskCommentAttachment[] = Array.from(files).map(
      (file) => ({
        id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type,
      }),
    );

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    if (mode === "DEADLINE_PROPOSAL") {
      if (!proposedDeadline) {
        alert("Vui lòng chọn thời hạn mới khi đề xuất đổi Deadline.");
        return;
      }
      const propDate = new Date(proposedDeadline);
      if (propDate <= new Date()) {
        alert("Thời hạn đề xuất phải sau thời điểm hiện tại.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        content: content.trim(),
        type: mode,
        mentions,
        links,
        attachments: attachments.length > 0 ? attachments : undefined,
        proposedDeadline:
          mode === "DEADLINE_PROPOSAL" ? proposedDeadline : undefined,
      });

      setContent("");
      setProposedDeadline("");
      setMentions([]);
      setLinks([]);
      setAttachments([]);
      setMode("COMMENT");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(mentionQuery),
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col rounded-xl border border-border bg-card shadow-sm transition focus-within:border-primary/60"
    >
      {/* Mode Switcher */}
      <div className="flex items-center gap-1 border-b border-border bg-muted/40 px-3 py-1.5 text-xs">
        <button
          type="button"
          onClick={() => setMode("COMMENT")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
            mode === "COMMENT"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>💬</span>
          <span>Bình luận</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (hasPendingProposal) {
              alert(
                "Task này đang có một đề xuất đổi Deadline chờ duyệt. Vui lòng đợi Quản lý xử lý trước khi tạo đề xuất mới.",
              );
              return;
            }
            setMode("DEADLINE_PROPOSAL");
          }}
          disabled={hasPendingProposal}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition ${
            hasPendingProposal
              ? "cursor-not-allowed opacity-50"
              : mode === "DEADLINE_PROPOSAL"
                ? "bg-amber-100 text-amber-900 shadow-sm dark:bg-amber-900/40 dark:text-amber-200"
                : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>⏱</span>
          <span>Đề xuất đổi Deadline</span>
          {hasPendingProposal && (
            <span className="rounded bg-amber-200 px-1 text-[10px] text-amber-800 dark:bg-amber-800 dark:text-amber-100">
              Đang có đề xuất
            </span>
          )}
        </button>
      </div>

      {/* Deadline Picker for Proposal Mode */}
      {mode === "DEADLINE_PROPOSAL" && (
        <div className="flex flex-wrap items-center gap-3 border-b border-amber-200 bg-amber-50/70 px-3 py-2 text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <span className="font-semibold text-amber-800 dark:text-amber-300">
            Hạn hoàn thành mới đề xuất:
          </span>
          <input
            type="datetime-local"
            min={minDateTime}
            value={proposedDeadline}
            onChange={(e) => setProposedDeadline(e.target.value)}
            required
            className="rounded-md border border-amber-300 bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-amber-700"
          />
          <span className="text-[11px] text-amber-700 dark:text-amber-400">
            * Hãy nhập lý do chi tiết vào khung bên dưới để Quản lý xét duyệt
          </span>
        </div>
      )}

      {/* Mention Popup Menu */}
      {showMentionMenu && filteredUsers.length > 0 && (
        <div className="absolute top-12 left-4 z-50 max-h-48 w-60 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Nhắc tên đồng nghiệp
          </div>
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelectMention(user)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-foreground transition hover:bg-muted"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {user.name.charAt(0)}
              </span>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {user.role}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleTextChange}
        onPaste={handlePaste}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            void handleSubmit(e);
          }
        }}
        placeholder={
          mode === "DEADLINE_PROPOSAL"
            ? "Nhập lý do đề xuất đổi deadline (nhấn @ để nhắc tên Quản lý/Nhân viên, dán link Google Drive/Figma/GitHub)..."
            : "Viết bình luận, trao đổi... (nhấn @ để nhắc tên đồng nghiệp, dán link tài liệu/file)..."
        }
        rows={3}
        className="w-full resize-none border-0 bg-transparent p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
      />

      {/* Link Previews */}
      {links.length > 0 && (
        <div className="border-t border-border px-3 py-2">
          <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
            Liên kết được đính kèm:
          </div>
          <div className="flex flex-col gap-1">
            {links.map((link, idx) => (
              <TaskLinkPreview
                key={idx}
                url={link}
                compact
                onRemove={() =>
                  setLinks((prev) => prev.filter((_, i) => i !== idx))
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="border-t border-border px-3 py-2">
          <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
            Tệp đính kèm:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {attachments.map((att) => (
              <span
                key={att.id}
                className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-foreground"
              >
                <span>📎 {att.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((prev) =>
                      prev.filter((a) => a.id !== att.id),
                    )
                  }
                  className="ml-1 text-muted-foreground hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Link Input Box */}
      {showLinkInput && (
        <div className="flex items-center gap-2 border-t border-border bg-muted/20 px-3 py-2">
          <input
            type="url"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="Dán link Google Drive, Figma, GitHub hoặc trang web..."
            className="flex-1 rounded border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddLink();
              }
            }}
          />
          <Button size="sm" type="button" onClick={handleAddLink}>
            Thêm
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setShowLinkInput(false)}
          >
            Hủy
          </Button>
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex items-center justify-between border-t border-border bg-muted/10 px-3 py-2">
        <div className="flex items-center gap-1">
          {/* Tag @ button */}
          <button
            type="button"
            onClick={() => {
              setContent((prev) => prev + "@");
              textareaRef.current?.focus();
              setShowMentionMenu(true);
            }}
            className="rounded p-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Nhắc tên (@)"
          >
            @
          </button>

          {/* Add link button */}
          <button
            type="button"
            onClick={() => setShowLinkInput((prev) => !prev)}
            className="rounded p-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Đính kèm liên kết"
          >
            🔗
          </button>

          {/* Attach file button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded p-1.5 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title="Đính kèm tệp tin"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] text-muted-foreground sm:inline">
            Ctrl + Enter để gửi
          </span>
          <Button
            size="sm"
            type="submit"
            disabled={!content.trim() || isSubmitting}
            loading={isSubmitting}
            variant={mode === "DEADLINE_PROPOSAL" ? "primary" : "primary"}
          >
            {mode === "DEADLINE_PROPOSAL" ? "Gửi đề xuất" : "Gửi bình luận"}
          </Button>
        </div>
      </div>
    </form>
  );
};
