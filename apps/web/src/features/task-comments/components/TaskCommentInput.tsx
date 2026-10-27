'use client';

import React, { useRef, useState } from 'react';
import { useMentionableUsers } from '../hooks/useMentionableUsers';
import type { CreateCommentPayload, MentionableUser, TaskCommentAttachment } from '../types';
import Button from '../ui/Button';
import { TaskLinkPreview } from './TaskLinkPreview';

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
  const [mode, setMode] = useState<'COMMENT' | 'DEADLINE_PROPOSAL'>('COMMENT');
  const [content, setContent] = useState('');
  const [proposedDeadline, setProposedDeadline] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<TaskCommentAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionCursorPos, setMentionCursorPos] = useState<number>(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Định dạng ngày giờ tối thiểu là hiện tại
  const nowIso = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const pos = e.target.selectionStart;
    setContent(text);

    // Kiểm tra xem con trỏ có đang đứng sau ký tự @ không
    const beforeCursor = text.substring(0, pos);
    const lastAtIdx = beforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      const charBeforeAt = lastAtIdx > 0 ? beforeCursor[lastAtIdx - 1] : ' ';
      if (charBeforeAt === ' ' || charBeforeAt === '\n') {
        const query = beforeCursor.substring(lastAtIdx + 1);
        if (!query.includes(' ')) {
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
    const afterQuery = content.substring(textareaRef.current?.selectionStart || content.length);
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
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    setLinks((prev) => Array.from(new Set([...prev, url])));
    setNewLinkUrl('');
    setShowLinkInput(false);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = pastedText.match(urlRegex);
    if (matches && matches.length > 0) {
      setLinks((prev) => Array.from(new Set([...prev, ...matches])));
    }
  };

  const handleRemoveLink = (idx: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveLinkByUrl = (targetUrl: string) => {
    setLinks((prev) => prev.filter((l) => l !== targetUrl));
    setContent((prev) => prev.replace(targetUrl, '').trim());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: TaskCommentAttachment[] = Array.from(files).map((f) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      url: URL.createObjectURL(f),
      size: f.size,
      mimeType: f.type,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const isProposal = mode === 'DEADLINE_PROPOSAL';

  // Tự động nhận diện tất cả link (từ nút đính kèm và dán trực tiếp trong nội dung)
  const contentUrls = content.match(/(https?:\/\/[^\s]+)/g) ?? [];
  const allDetectedLinks = Array.from(new Set([...links, ...contentUrls]));

  const canSubmit = isProposal
    ? !hasPendingProposal && content.trim().length > 0 && Boolean(proposedDeadline)
    : content.trim().length > 0 || attachments.length > 0 || allDetectedLinks.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        content: content.trim(),
        type: mode,
        proposedDeadline: isProposal ? new Date(proposedDeadline).toISOString() : undefined,
        mentions,
        links: allDetectedLinks,
        attachments,
      });

      // Reset form
      setContent('');
      setProposedDeadline('');
      setMentions([]);
      setLinks([]);
      setAttachments([]);
      setShowMentionMenu(false);
      if (isProposal) {
        setMode('COMMENT');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(mentionQuery),
  );

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      {/* Tabs chuyển đổi giữa Bình luận và Đề xuất đổi Deadline */}
      <div className="mb-2.5 flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setMode('COMMENT')}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            mode === 'COMMENT'
              ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          <span>💬</span>
          <span>Bình luận</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('DEADLINE_PROPOSAL')}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            mode === 'DEADLINE_PROPOSAL'
              ? 'bg-warning-50 text-warning-700 dark:bg-warning-950/40 dark:text-warning-300'
              : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          <span>📅</span>
          <span>Đề xuất đổi Deadline</span>
          {hasPendingProposal && (
            <span className="rounded bg-warning-200 px-1 text-[10px] text-warning-800">
              Có 1 đề xuất chờ
            </span>
          )}
        </button>
      </div>

      {/* Cảnh báo nếu đang có đề xuất chờ duyệt (BR-TSK-04) */}
      {isProposal && hasPendingProposal && (
        <div className="mb-3 rounded-lg border border-warning-200 bg-warning-50 p-2.5 text-xs text-warning-800 dark:border-warning-900/50 dark:bg-warning-950/30 dark:text-warning-300">
          ⚠️ <strong>Lưu ý:</strong> Task này đã có một đề xuất đổi Deadline đang chờ Quản lý duyệt (tối đa 1 đề xuất chờ duyệt/task). Vui lòng đợi kết quả trước khi gửi đề xuất mới.
        </div>
      )}

      {/* Khung chọn ngày giờ khi đề xuất đổi Deadline */}
      {isProposal && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-warning-50/50 p-2.5 dark:bg-warning-950/20">
          <label className="text-xs font-semibold text-warning-900 dark:text-warning-200">
            ⏰ Hạn chót mới đề xuất:
          </label>
          <input
            type="datetime-local"
            min={nowIso}
            disabled={hasPendingProposal}
            value={proposedDeadline}
            onChange={(e) => setProposedDeadline(e.target.value)}
            className="rounded border border-warning-300 bg-white px-2 py-1 text-xs text-gray-800 outline-none focus:border-warning-500 disabled:opacity-50 dark:border-warning-700 dark:bg-gray-800 dark:text-white"
          />
          <span className="text-[11px] text-gray-500">
            * Thời hạn phải ở tương lai và kèm lý do bên dưới
          </span>
        </div>
      )}

      {/* Autocomplete Popup @mentions */}
      {showMentionMenu && (
        <div className="absolute bottom-full left-3 z-50 mb-2 max-h-48 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Gợi ý nhân sự
          </div>
          {filteredUsers.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500">Không tìm thấy nhân sự phù hợp</div>
          ) : (
            filteredUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectMention(u)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 dark:bg-brand-900 dark:text-brand-300">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 truncate">
                  <div className="truncate font-medium text-gray-900 dark:text-white">{u.name}</div>
                  <div className="text-xs text-gray-400">{u.role}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Danh sách link đã đính kèm */}
      {links.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {links.map((link, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
            >
              🔗 <span className="max-w-[200px] truncate">{link}</span>
              <button
                type="button"
                onClick={() => handleRemoveLink(idx)}
                className="ml-1 font-bold hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Danh sách tệp đã đính kèm */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {attachments.map((att, idx) => (
            <span
              key={att.id}
              className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              📎 <span className="max-w-[180px] truncate">{att.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(idx)}
                className="ml-1 font-bold hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input chèn liên kết */}
      {showLinkInput && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
          <input
            type="text"
            placeholder="Nhập URL (Google Drive, Figma, GitHub...)..."
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
            className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddLink}
            className="rounded bg-brand-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-600"
          >
            Thêm
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            Hủy
          </button>
        </div>
      )}

      {/* Textarea nhập nội dung */}
      <textarea
        ref={textareaRef}
        rows={3}
        disabled={isProposal && hasPendingProposal}
        value={content}
        onChange={handleTextChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        placeholder={
          isProposal
            ? 'Nhập lý do đề xuất đổi Deadline (bắt buộc)... Gõ @ để nhắc tên Quản lý'
            : "Viết bình luận hoặc dán link Google Drive, Figma, GitHub... Gõ '@' để nhắc tên"
        }
        className="w-full resize-none border-0 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 dark:text-white dark:placeholder-gray-500"
      />

      {/* Khung xem trước tài nguyên trực tiếp (Live Resource Preview) */}
      {allDetectedLinks.length > 0 && (
        <div className="mt-2.5 space-y-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-2.5 dark:border-gray-700/60 dark:bg-gray-800/40">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1.5">
              <span>⚡</span>
              <span>Khung xem trước tài nguyên ({allDetectedLinks.length}):</span>
            </span>
            <span className="text-[11px] font-normal text-gray-400">
              Tự động nhận diện Google Drive • Figma • GitHub
            </span>
          </div>

          <div className="space-y-2">
            {allDetectedLinks.map((url, idx) => (
              <TaskLinkPreview
                key={`${url}-${idx}`}
                url={url}
                onRemove={() => handleRemoveLinkByUrl(url)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toolbar & Nút gửi */}
      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-gray-800">
        <div className="flex items-center gap-1">
          {/* Nút Tag @ */}
          <button
            type="button"
            title="Nhắc tên ai đó (@)"
            onClick={() => {
              setContent((prev) => prev + '@');
              setShowMentionMenu(true);
              setMentionQuery('');
              setMentionCursorPos(content.length);
              textareaRef.current?.focus();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            @
          </button>

          {/* Nút Đính kèm Link */}
          <button
            type="button"
            title="Đính kèm liên kết"
            onClick={() => setShowLinkInput((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            🔗
          </button>

          {/* Nút Đính kèm File */}
          <button
            type="button"
            title="Đính kèm tệp tin"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-brand-500 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-gray-400 sm:inline">Ctrl + Enter để gửi</span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !canSubmit}
            variant={isProposal ? 'primary' : 'primary'}
          >
            {isSubmitting
              ? 'Đang gửi...'
              : isProposal
              ? 'Gửi đề xuất'
              : 'Gửi bình luận'}
          </Button>
        </div>
      </div>
    </div>
  );
};
