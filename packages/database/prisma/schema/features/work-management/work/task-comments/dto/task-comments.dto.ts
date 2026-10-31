import { z } from "zod";

export const attachmentSchema = z
  .object({
    label: z.string().trim().min(1).max(200),
    url: z.url().max(2000),
    provider: z.enum(["GITHUB", "FIGMA", "DRIVE", "LINK"]).default("LINK"),
  })
  .strict();

export const commentInput = z
  .object({
    taskId: z.uuid(),
    body: z.string().trim().min(1).max(4000),
    mentions: z.array(z.string().trim().min(1).max(150)).max(50).default([]),
    attachments: z.array(attachmentSchema).max(10).default([]),
  })
  .strict();

export const systemCommentInput = commentInput
  .omit({ mentions: true, attachments: true })
  .extend({ author: z.string().trim().min(1).max(200) });

export const listQuery = z
  .object({
    taskId: z.uuid(),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict();

export const countsQuery = z
  .object({ taskIds: z.string().min(1).max(4000) })
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

export type CommentInput = z.infer<typeof commentInput>;
export type SystemCommentInput = z.infer<typeof systemCommentInput>;
export type CommentDto = z.infer<typeof commentSchema>;
export type CommentListQuery = z.infer<typeof listQuery>;
