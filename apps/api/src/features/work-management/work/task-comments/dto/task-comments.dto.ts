import { z } from "zod";

export const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  size: z.number().optional(),
  mimeType: z.string().optional(),
});

export const createTaskCommentSchema = z
  .object({
    content: z.string().trim().min(1, "Nội dung bình luận không được để trống"),
    type: z
      .enum(["COMMENT", "DEADLINE_PROPOSAL"])
      .default("COMMENT")
      .optional(),
    mentions: z.array(z.string()).default([]).optional(),
    links: z.array(z.string()).default([]).optional(),
    attachments: z.array(attachmentSchema).optional(),
    proposedDeadline: z.string().optional(),
    authorId: z.string().optional(),
    authorName: z.string().optional(),
    authorRole: z.string().optional(),
    authorAvatar: z.string().optional(),
  })
  .strict();

export type CreateTaskCommentInput = z.infer<typeof createTaskCommentSchema>;

export const rejectDeadlineProposalSchema = z
  .object({
    reason: z.string().trim().min(1, "Lý do từ chối là bắt buộc"),
    reviewerId: z.string().optional(),
    reviewerName: z.string().optional(),
  })
  .strict();

export type RejectDeadlineProposalInput = z.infer<
  typeof rejectDeadlineProposalSchema
>;

export const createSystemLogSchema = z
  .object({
    action: z.enum(["PAUSE", "CANCEL", "REWORK", "REASSIGN"]),
    reason: z.string().trim().optional(),
    newAssigneeId: z.string().optional(),
    newAssigneeName: z.string().optional(),
    authorId: z.string().optional(),
    authorName: z.string().optional(),
  })
  .strict();

export type CreateSystemLogInput = z.infer<typeof createSystemLogSchema>;

export const listCommentsQuery = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export type ListCommentsQuery = z.infer<typeof listCommentsQuery>;
