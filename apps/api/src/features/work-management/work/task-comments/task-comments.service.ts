import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { TaskCommentsRepository } from "./task-comments.repository.js";
import type {
  CreateTaskCommentInput,
  ListCommentsQuery,
  RejectDeadlineProposalInput,
  CreateSystemLogInput,
} from "./dto/task-comments.dto.js";
import type {
  PaginatedTaskComments,
  TaskCommentAuthor,
  TaskCommentItem,
} from "./task-comments.types.js";

@Injectable()
export class TaskCommentsService {
  constructor(private readonly repository: TaskCommentsRepository) {}

  async getComments(
    taskId: string,
    query?: ListCommentsQuery,
  ): Promise<PaginatedTaskComments> {
    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.min(100, Math.max(1, query?.limit ?? 20));
    const skip = (page - 1) * limit;

    const { items, total } = await this.repository.list(taskId, skip, limit);

    const userList = this.repository.getMentionableUsers();
    const userMap = new Map(userList.map((u) => [u.id, u]));

    const mappedItems: TaskCommentItem[] = items.map((c) => {
      const author: TaskCommentAuthor = {
        id: c.authorId || "usr_anonymous",
        name: c.authorName || "Người dùng",
        role: c.authorRole || "STAFF",
        avatarUrl: c.authorAvatar || null,
      };

      const mentionedUsers: TaskCommentAuthor[] = c.mentions
        .map((mId) => userMap.get(mId))
        .filter((u): u is TaskCommentAuthor => Boolean(u));

      return {
        id: c.id,
        taskId: c.taskId,
        authorId: c.authorId,
        content: c.content,
        type: c.type,
        mentions: c.mentions,
        links: c.links,
        attachments:
          (c.attachments as unknown as TaskCommentItem["attachments"]) ?? null,
        proposedDeadline: c.proposedDeadline,
        proposalStatus: c.proposalStatus,
        reviewedById: c.reviewedById,
        rejectionReason: c.rejectionReason,
        isSystemLog: c.isSystemLog,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        author,
        mentionedUsers,
      };
    });

    return {
      items: mappedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createComment(
    taskId: string,
    dto: CreateTaskCommentInput,
  ): Promise<TaskCommentItem> {
    const isProposal = dto.type === "DEADLINE_PROPOSAL";

    if (isProposal) {
      if (!dto.proposedDeadline) {
        throw new BadRequestException(
          "Thời hạn đề xuất là bắt buộc khi tạo đề xuất đổi Deadline.",
        );
      }
      const propDate = new Date(dto.proposedDeadline);
      if (isNaN(propDate.getTime()) || propDate <= new Date()) {
        throw new BadRequestException(
          "Thời hạn đề xuất phải là một thời điểm trong tương lai.",
        );
      }
      const existingPending = await this.repository.findPendingProposal(taskId);
      if (existingPending) {
        throw new ConflictException(
          "Task này đã có một đề xuất đổi Deadline đang chờ duyệt.",
        );
      }
    }

    const URL_REGEX = /(https?:\/\/[^\s]+)/g;
    const contentUrls = dto.content.match(URL_REGEX) ?? [];
    const allLinks = Array.from(
      new Set([...(dto.links ?? []), ...contentUrls]),
    );

    const authorId = dto.authorId || "usr_mgr_01";
    const authorName = dto.authorName || "Hoàng Tuấn Bảo";
    const authorRole = dto.authorRole || "MANAGER";

    const comment = await this.repository.create({
      taskId,
      authorId,
      authorName,
      authorRole,
      authorAvatar: dto.authorAvatar || null,
      content: dto.content,
      type: dto.type ?? "COMMENT",
      mentions: dto.mentions ?? [],
      links: allLinks,
      attachments: dto.attachments,
      proposedDeadline: dto.proposedDeadline
        ? new Date(dto.proposedDeadline)
        : undefined,
      proposalStatus: isProposal ? "PENDING" : undefined,
    });

    const author: TaskCommentAuthor = {
      id: authorId,
      name: authorName,
      role: authorRole,
      avatarUrl: dto.authorAvatar || null,
    };

    return {
      id: comment.id,
      taskId: comment.taskId,
      authorId: comment.authorId,
      content: comment.content,
      type: comment.type,
      mentions: comment.mentions,
      links: comment.links,
      attachments:
        (comment.attachments as unknown as TaskCommentItem["attachments"]) ??
        null,
      proposedDeadline: comment.proposedDeadline,
      proposalStatus: comment.proposalStatus,
      reviewedById: comment.reviewedById,
      rejectionReason: comment.rejectionReason,
      isSystemLog: comment.isSystemLog,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author,
    };
  }

  async countComments(
    taskId: string,
  ): Promise<{ taskId: string; count: number }> {
    const count = await this.repository.count(taskId);
    return { taskId, count };
  }

  async approveDeadlineProposal(
    taskId: string,
    commentId: string,
    reviewerId = "usr_mgr_01",
    reviewerName = "Hoàng Tuấn Bảo",
  ) {
    const comment = await this.repository.findById(commentId);
    if (!comment || comment.taskId !== taskId) {
      throw new NotFoundException("Đề xuất không tồn tại trong công việc này.");
    }
    if (
      comment.type !== "DEADLINE_PROPOSAL" ||
      comment.proposalStatus !== "PENDING"
    ) {
      throw new BadRequestException(
        "Bình luận này không phải là đề xuất đổi Deadline đang chờ duyệt.",
      );
    }
    if (!comment.proposedDeadline) {
      throw new BadRequestException("Đề xuất không có thời hạn mới.");
    }

    const updatedComment = await this.repository.update(commentId, {
      proposalStatus: "APPROVED",
      reviewedById: reviewerId,
    });

    const formattedDate = new Date(comment.proposedDeadline).toLocaleString(
      "vi-VN",
    );
    await this.repository.create({
      taskId,
      authorId: reviewerId,
      authorName: reviewerName,
      authorRole: "MANAGER",
      content: `${reviewerName} đã chấp thuận đề xuất đổi Deadline sang ${formattedDate}.`,
      isSystemLog: true,
      type: "COMMENT",
    });

    return {
      comment: updatedComment,
      newDeadline: comment.proposedDeadline,
    };
  }

  async rejectDeadlineProposal(
    taskId: string,
    commentId: string,
    dto: RejectDeadlineProposalInput,
  ) {
    const comment = await this.repository.findById(commentId);
    if (!comment || comment.taskId !== taskId) {
      throw new NotFoundException("Đề xuất không tồn tại trong công việc này.");
    }
    if (
      comment.type !== "DEADLINE_PROPOSAL" ||
      comment.proposalStatus !== "PENDING"
    ) {
      throw new BadRequestException(
        "Bình luận này không phải là đề xuất đổi Deadline đang chờ duyệt.",
      );
    }

    const reviewerId = dto.reviewerId || "usr_mgr_01";
    const reviewerName = dto.reviewerName || "Hoàng Tuấn Bảo";

    const updatedComment = await this.repository.update(commentId, {
      proposalStatus: "REJECTED",
      reviewedById: reviewerId,
      rejectionReason: dto.reason,
    });

    await this.repository.create({
      taskId,
      authorId: reviewerId,
      authorName: reviewerName,
      authorRole: "MANAGER",
      content: `${reviewerName} đã từ chối đề xuất đổi Deadline. Lý do: ${dto.reason}`,
      isSystemLog: true,
      type: "COMMENT",
    });

    return { comment: updatedComment };
  }

  getMentionableUsers(): TaskCommentAuthor[] {
    return this.repository.getMentionableUsers();
  }

  async recordSystemLog(taskId: string, dto: CreateSystemLogInput) {
    const authorName = dto.authorName || "Người dùng";
    const authorId = dto.authorId || "usr_system";

    let content = "";
    const mentions: string[] = [];

    switch (dto.action) {
      case "PAUSE":
        content = `${authorName} đã hoãn công việc.${dto.reason ? ` Lý do: ${dto.reason}` : ""}`;
        break;
      case "CANCEL":
        content = `${authorName} đã hủy công việc.${dto.reason ? ` Lý do: ${dto.reason}` : ""}`;
        break;
      case "REWORK":
        content = `${authorName} đã yêu cầu làm lại công việc.${dto.reason ? ` Lý do: ${dto.reason}` : ""}`;
        break;
      case "REASSIGN": {
        const assigneeName = dto.newAssigneeName || "nhân sự mới";
        if (dto.newAssigneeId) {
          mentions.push(dto.newAssigneeId);
        }
        content = `${authorName} đã giao lại công việc cho ${assigneeName}.${
          dto.reason ? ` Lý do: ${dto.reason}` : ""
        }`;
        break;
      }
    }

    return this.repository.create({
      taskId,
      authorId,
      authorName,
      content,
      type: "COMMENT",
      isSystemLog: true,
      mentions,
      links: [],
    });
  }
}
