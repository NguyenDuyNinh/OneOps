"use client";
import type { TaskComment } from "../types";
import { Button } from "./primitives/button";
import { Input } from "./primitives/forms";
import styles from "./styles.module.css";
export function TaskComments({
  comments,
  pending,
  onSubmit,
}: {
  comments: TaskComment[];
  pending: boolean;
  onSubmit: (comment: TaskComment) => Promise<boolean>;
}) {
  return (
    <section className={styles.comments}>
      <h3>Trao đổi</h3>
      {comments.map((comment) => (
        <div className={styles.comment} key={comment.id}>
          <small>
            {comment.author} ·{" "}
            {new Date(comment.createdAt).toLocaleString("vi-VN")}
          </small>
          <p>{comment.text}</p>
        </div>
      ))}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const data = new FormData(form);
          const text = String(data.get("comment") || "").trim();
          if (!text) return;
          const saved = await onSubmit({
            id: crypto.randomUUID(),
            text,
            author: String(data.get("author") || "Tôi"),
            createdAt: new Date().toISOString(),
          });
          if (saved) form.reset();
        }}
      >
        <label>
          Tên hiển thị
          <Input name="author" defaultValue="Tôi" required maxLength={150} />
        </label>
        <label>
          Nội dung trao đổi
          <Input name="comment" required maxLength={2000} />
        </label>
        <Button type="submit" disabled={pending}>
          Gửi trao đổi
        </Button>
      </form>
    </section>
  );
}
