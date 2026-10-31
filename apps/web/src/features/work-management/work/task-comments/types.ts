import { z } from "zod";

export const attachmentSchema = z
  .object({
    label: z.string().trim().min(1, "Nhập tên tệp hoặc liên kết").max(200),
    url: z.url("Liên kết không hợp lệ").max(2000),
    provider: z.enum(["GITHUB", "FIGMA", "DRIVE", "LINK"]).default("LINK"),
  })
  .strict();

export const commentSchema = z
  .object({
    id: z.uuid(),
    taskId: z.uuid(),
    author: z.string(),
    body: z.string(),
    mentions: z.array(z.string()),
    attachments: z.array(attachmentSchema),
    kind: z.enum(["COMMENT", "SYSTEM"]),
    createdAt: z.iso.datetime(),
  })
  .strict();

export const commentInput = z
  .object({
    taskId: z.uuid(),
    body: z.string().trim().min(1, "Nhập nội dung trao đổi").max(4000),
    mentions: z.array(z.string().trim().min(1).max(150)).max(50).default([]),
    attachments: z.array(attachmentSchema).max(10).default([]),
  })
  .strict();

export const commentPageSchema = z
  .object({
    items: z.array(commentSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
  .strict();

export type CommentDto = z.infer<typeof commentSchema>;
export type CommentInput = z.input<typeof commentInput>;
export type Attachment = z.infer<typeof attachmentSchema>;

/** Extracts `@name` handles so the API can notify the mentioned people. */
export function parseMentions(body: string) {
  const found = new Set<string>();
  for (const match of body.matchAll(/(?:^|\s)@([^\s@,;:]+)/g))
    found.add(match[1].replace(/[.。]+$/, ""));
  return [...found].slice(0, 50);
}
