"use client";
import { useCallback, useEffect, useState } from "react";
import { client } from "@/features/work-management/work/task-comments/api/client";
import {
  attachmentSchema,
  commentInput,
  parseMentions,
  type Attachment,
  type CommentDto,
} from "@/features/work-management/work/task-comments/types";
import { Button } from "@/features/work-management/work/task-comments/components/primitives/button";
import {
  Input,
  Select,
  Textarea,
} from "@/features/work-management/work/task-comments/components/primitives/forms";
import styles from "@/features/work-management/work/task-comments/components/styles.module.css";

const providers = ["LINK", "GITHUB", "FIGMA", "DRIVE"] as const;
const emptyAttachment: Attachment = { label: "", url: "", provider: "LINK" };

export function TaskComments({
  taskId,
  refreshKey,
}: {
  taskId: string;
  /** Bump to refetch without losing the draft, e.g. after a status change. */
  refreshKey?: string | number;
}) {
  const [state, setState] = useState<{
    items: CommentDto[];
    error: string;
    key: string;
  }>({ items: [], error: "", key: "" });
  const [revision, setRevision] = useState(0);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [draft, setDraft] = useState<Attachment>(emptyAttachment);
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const key = `${taskId}:${revision}:${refreshKey ?? ""}`;
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    client
      .list(taskId, controller.signal)
      .then((page) => setState({ items: page.items, error: "", key }))
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setState({
          items: [],
          error:
            cause instanceof Error
              ? cause.message
              : "Không tải được trao đổi của công việc.",
          key,
        });
      });
    return () => controller.abort();
  }, [taskId, key]);

  const loading = state.key !== key;

  const mentions = parseMentions(body);

  async function submit() {
    if (pending) return;
    const parsed = commentInput.safeParse({
      taskId,
      body,
      mentions,
      attachments,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Kiểm tra nội dung trao đổi");
      return;
    }
    setPending(true);
    setError("");
    try {
      const saved = await client.create(parsed.data);
      setState((current) => ({ ...current, items: [...current.items, saved] }));
      setBody("");
      setAttachments([]);
      setAdding(false);
      setDraft(emptyAttachment);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không gửi được trao đổi.",
      );
    } finally {
      setPending(false);
    }
  }

  function addAttachment() {
    // Same rule as the API so a bad link is caught before submitting.
    const parsed = attachmentSchema.safeParse(draft);
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message || "Kiểm tra thông tin đính kèm.",
      );
      return;
    }
    setError("");
    setAttachments((current) => [...current, draft].slice(0, 10));
    setDraft(emptyAttachment);
    setAdding(false);
  }

  return (
    <section className={styles.comments} aria-label="Trao đổi của công việc">
      <h3>Trao đổi</h3>
      {loading ? (
        <p role="status" className={styles.muted}>
          Đang tải trao đổi…
        </p>
      ) : state.error ? (
        <div role="alert" className={styles.error}>
          {state.error}
          <Button variant="ghost" size="sm" onClick={reload}>
            Thử lại
          </Button>
        </div>
      ) : !state.items.length ? (
        <p className={styles.muted}>
          Chưa có trao đổi. Dùng @tên để nhắc đồng nghiệp cùng theo dõi.
        </p>
      ) : (
        <ol className={styles.list}>
          {state.items.map((comment) => (
            <li key={comment.id} className={styles.comment}>
              <div className={styles.meta}>
                <strong>{comment.author}</strong>
                <span>
                  {new Date(comment.createdAt).toLocaleString("vi-VN")}
                </span>
                {comment.kind === "SYSTEM" && (
                  <span className={styles.system}>Hệ thống</span>
                )}
              </div>
              <p>{comment.body}</p>
              {comment.mentions.length > 0 && (
                <p className={styles.mentions}>
                  {comment.mentions.map((name) => (
                    <span key={name}>@{name}</span>
                  ))}
                </p>
              )}
              {comment.attachments.length > 0 && (
                <ul className={styles.attachments}>
                  {comment.attachments.map((item) => (
                    <li key={`${comment.id}-${item.url}`}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      )}

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label>
          Nội dung trao đổi
          <Textarea
            value={body}
            maxLength={4000}
            rows={3}
            placeholder="Viết trao đổi, dùng @ten để nhắc đồng nghiệp"
            onChange={(event) => setBody(event.target.value)}
          />
        </label>
        {mentions.length > 0 && (
          <p className={styles.mentions} aria-live="polite">
            Sẽ nhắc: {mentions.map((name) => `@${name}`).join(", ")}
          </p>
        )}
        {attachments.length > 0 && (
          <ul className={styles.attachments}>
            {attachments.map((item, index) => (
              <li key={`${item.url}-${index}`}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Bỏ đính kèm ${item.label}`}
                  onClick={() =>
                    setAttachments((current) =>
                      current.filter((_, position) => position !== index),
                    )
                  }
                >
                  Bỏ
                </Button>
              </li>
            ))}
          </ul>
        )}
        {adding && (
          <div className={styles.attachmentForm}>
            <label>
              Tên hiển thị
              <Input
                value={draft.label}
                maxLength={200}
                onChange={(event) =>
                  setDraft({ ...draft, label: event.target.value })
                }
              />
            </label>
            <label>
              Liên kết
              <Input
                type="url"
                value={draft.url}
                maxLength={2000}
                placeholder="https://…"
                onChange={(event) =>
                  setDraft({ ...draft, url: event.target.value })
                }
              />
            </label>
            <label>
              Nguồn
              <Select
                value={draft.provider}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    provider: event.target.value as Attachment["provider"],
                  })
                }
              >
                {providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </Select>
            </label>
            <div className={styles.actions}>
              <Button variant="secondary" size="sm" onClick={addAttachment}>
                Lưu đính kèm
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setDraft(emptyAttachment);
                }}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div className={styles.actions}>
          <Button type="submit" loading={pending} disabled={!body.trim()}>
            Gửi trao đổi
          </Button>
          <Button
            variant="secondary"
            onClick={() => setAdding(!adding)}
            disabled={attachments.length >= 10}
          >
            Đính kèm
          </Button>
        </div>
      </form>
    </section>
  );
}
