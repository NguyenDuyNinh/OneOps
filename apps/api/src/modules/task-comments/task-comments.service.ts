import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CommentType, Prisma, ProposalStatus, TaskDeadlineStatus } from '@prisma/client';
import { PrismaService } from '../database';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import type {
  PaginatedTaskComments,
  TaskCommentAuthor,
  TaskCommentItem,
  TaskCommentedEvent,
} from './task-comments.types';

@Injectable()
export class TaskCommentsService {
  private readonly logger = new Logger(TaskCommentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getComments(
    taskId: string,
    query?: { page?: number; limit?: number },
  ): Promise<PaginatedTaskComments> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true },
    });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.min(100, Math.max(1, query?.limit ?? 20));
    const skip = (page - 1) * limit;

    const [total, comments] = await Promise.all([
      this.prisma.taskComment.count({ where: { taskId } }),
      this.prisma.taskComment.findMany({
        where: { taskId },
        include: {
          author: {
            select: { id: true, name: true, role: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    const allMentionIds = Array.from(new Set(comments.flatMap((c) => c.mentions)));
    const mentionedUsers: TaskCommentAuthor[] =
      allMentionIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: allMentionIds } },
            select: { id: true, name: true, avatarUrl: true, role: true },
          })
        : [];

    const userMap = new Map(mentionedUsers.map((u) => [u.id, u]));

    const items: TaskCommentItem[] = comments.map((c) => ({
      ...c,
      author: c.author ?? undefined,
      attachments: (c.attachments as unknown as TaskCommentItem['attachments']) ?? null,
      mentionedUsers: c.mentions.map((id) => userMap.get(id)).filter((u): u is TaskCommentAuthor => Boolean(u)),
    }));

    return {
      items,
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
    authorId: string,
    dto: CreateTaskCommentDto,
  ): Promise<TaskCommentItem> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, assigneeId: true, createdById: true },
    });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const isProposal = dto.type === CommentType.DEADLINE_PROPOSAL;
    if (isProposal) {
      if (!dto.proposedDeadline) {
        throw new BadRequestException('Thời hạn đề xuất là bắt buộc khi tạo đề xuất đổi Deadline.');
      }
      const propDate = new Date(dto.proposedDeadline);
      if (isNaN(propDate.getTime()) || propDate <= new Date()) {
        throw new BadRequestException('Thời hạn đề xuất phải là một thời điểm trong tương lai.');
      }
      const existingPending = await this.prisma.taskComment.findFirst({
        where: {
          taskId,
          type: CommentType.DEADLINE_PROPOSAL,
          proposalStatus: ProposalStatus.PENDING,
        },
        select: { id: true },
      });
      if (existingPending) {
        throw new ConflictException('Task này đã có một đề xuất đổi Deadline đang chờ duyệt.');
      }
    }

    const URL_REGEX = /(https?:\/\/[^\s]+)/g;
    const contentUrls = dto.content.match(URL_REGEX) ?? [];
    const allLinks = Array.from(new Set([...(dto.links ?? []), ...contentUrls]));

    const comment = await this.prisma.taskComment.create({
      data: {
        taskId,
        authorId,
        content: dto.content,
        type: dto.type ?? CommentType.COMMENT,
        mentions: dto.mentions ?? [],
        links: allLinks,
        attachments: dto.attachments ? (dto.attachments as Prisma.InputJsonValue) : Prisma.JsonNull,
        proposedDeadline: dto.proposedDeadline ? new Date(dto.proposedDeadline) : undefined,
        proposalStatus: isProposal ? ProposalStatus.PENDING : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true, avatarUrl: true },
        },
      },
    });

    const authorName = comment.author?.name ?? 'Người dùng';
    const commentedEvent: TaskCommentedEvent = {
      taskId: task.id,
      taskTitle: task.title,
      commentId: comment.id,
      authorId,
      authorName,
      content: comment.content,
      mentions: comment.mentions,
      type: comment.type,
    };
    this.eventEmitter.emit('task.commented', commentedEvent);

    return {
      ...comment,
      author: comment.author ?? undefined,
      attachments: (comment.attachments as unknown as TaskCommentItem['attachments']) ?? null,
    };
  }

  async countComments(taskId: string): Promise<{ taskId: string; count: number }> {
    const count = await this.prisma.taskComment.count({ where: { taskId } });
    return { taskId, count };
  }

  async approveDeadlineProposal(taskId: string, commentId: string, reviewerId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, deadline: true, deadlineStatus: true },
    });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const comment = await this.prisma.taskComment.findUnique({
      where: { id: commentId },
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });
    if (!comment || comment.taskId !== taskId) {
      throw new NotFoundException('Đề xuất không tồn tại trong công việc này');
    }
    if (comment.type !== CommentType.DEADLINE_PROPOSAL || comment.proposalStatus !== ProposalStatus.PENDING) {
      throw new BadRequestException('Bình luận này không phải là đề xuất đổi Deadline đang chờ duyệt');
    }
    if (!comment.proposedDeadline) {
      throw new BadRequestException('Đề xuất không có thời hạn mới');
    }

    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
      select: { id: true, name: true, role: true },
    });

    const newDeadline = comment.proposedDeadline;
    const now = new Date();
    const diffHours = (newDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    const deadlineStatus: TaskDeadlineStatus =
      diffHours <= 0
        ? TaskDeadlineStatus.OVERDUE
        : diffHours <= 24
        ? TaskDeadlineStatus.WARNING
        : TaskDeadlineStatus.NORMAL;

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedComment = await tx.taskComment.update({
        where: { id: commentId },
        data: {
          proposalStatus: ProposalStatus.APPROVED,
          reviewedById: reviewerId,
        },
        include: {
          author: { select: { id: true, name: true, role: true, avatarUrl: true } },
        },
      });

      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          deadline: newDeadline,
          deadlineStatus,
        },
      });

      const formattedDate = newDeadline.toLocaleString('vi-VN');
      await tx.taskComment.create({
        data: {
          taskId,
          authorId: reviewerId,
          content: `${reviewer?.name ?? 'Quản lý'} đã chấp thuận đề xuất đổi Deadline sang ${formattedDate}.`,
          isSystemLog: true,
        },
      });

      return { comment: updatedComment, task: updatedTask };
    });

    this.eventEmitter.emit('task.deadline_proposal_reviewed', {
      taskId,
      commentId,
      status: ProposalStatus.APPROVED,
      reviewedById: reviewerId,
      reviewedByName: reviewer?.name ?? 'Quản lý',
      newDeadline,
    });

    return result;
  }

  async rejectDeadlineProposal(
    taskId: string,
    commentId: string,
    reviewerId: string,
    reason: string,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, deadline: true, deadlineStatus: true },
    });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const comment = await this.prisma.taskComment.findUnique({
      where: { id: commentId },
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });
    if (!comment || comment.taskId !== taskId) {
      throw new NotFoundException('Đề xuất không tồn tại trong công việc này');
    }
    if (comment.type !== CommentType.DEADLINE_PROPOSAL || comment.proposalStatus !== ProposalStatus.PENDING) {
      throw new BadRequestException('Bình luận này không phải là đề xuất đổi Deadline đang chờ duyệt');
    }

    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
      select: { id: true, name: true, role: true },
    });

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedComment = await tx.taskComment.update({
        where: { id: commentId },
        data: {
          proposalStatus: ProposalStatus.REJECTED,
          reviewedById: reviewerId,
          rejectionReason: reason,
        },
        include: {
          author: { select: { id: true, name: true, role: true, avatarUrl: true } },
        },
      });

      await tx.taskComment.create({
        data: {
          taskId,
          authorId: reviewerId,
          content: `${reviewer?.name ?? 'Quản lý'} đã từ chối đề xuất đổi Deadline. Lý do: ${reason}`,
          isSystemLog: true,
        },
      });

      return { comment: updatedComment, task };
    });

    this.eventEmitter.emit('task.deadline_proposal_reviewed', {
      taskId,
      commentId,
      status: ProposalStatus.REJECTED,
      reviewedById: reviewerId,
      reviewedByName: reviewer?.name ?? 'Quản lý',
      rejectionReason: reason,
    });

    return result;
  }

  async getMentionableUsers(): Promise<TaskCommentAuthor[]> {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // ---------------------------------------------------------------------------
  // ROUND1-12: Tự động sinh bình luận hệ thống lưu lý do khi hoãn, hủy, làm lại, giao lại
  // ---------------------------------------------------------------------------

  /**
   * Lắng nghe sự kiện chuyển trạng thái task từ module Tasks
   * Tự động sinh comment hệ thống cho: PAUSED (hoãn), CANCELLED (hủy), REWORK (làm lại)
   */
  @OnEvent('task.status_changed')
  async handleTaskStatusChanged(payload: {
    taskId: string;
    fromStatus: string;
    toStatus: string;
    userId: string;
    reason?: string;
  }) {
    const { taskId, toStatus, userId } = payload;
    if (!['PAUSED', 'CANCELLED', 'REWORK'].includes(toStatus)) {
      return;
    }

    try {
      let reason = payload.reason;
      if (!reason) {
        const latestLog = await this.prisma.taskLog.findFirst({
          where: { taskId, toStatus: toStatus as any, changedById: userId },
          orderBy: { createdAt: 'desc' },
          select: { reason: true },
        });
        reason = latestLog?.reason ?? undefined;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      const userName = user?.name ?? 'Người dùng';

      let actionText = '';
      if (toStatus === 'PAUSED') {
        actionText = 'đã hoãn công việc';
      } else if (toStatus === 'CANCELLED') {
        actionText = 'đã hủy công việc';
      } else if (toStatus === 'REWORK') {
        actionText = 'đã yêu cầu làm lại công việc';
      }

      const content = `${userName} ${actionText}.${reason ? ` Lý do: ${reason}` : ''}`;

      await this.prisma.taskComment.create({
        data: {
          taskId,
          authorId: userId,
          content,
          type: CommentType.COMMENT,
          isSystemLog: true,
          mentions: [],
          links: [],
        },
      });

      this.logger.log(`Tự động ghi nhận bình luận hệ thống [${toStatus}] cho task ${taskId}`);
    } catch (error) {
      this.logger.error(`Lỗi khi tạo bình luận hệ thống [${toStatus}] cho task ${taskId}:`, error);
    }
  }

  /**
   * Lắng nghe sự kiện giao lại task từ module Tasks
   */
  @OnEvent('task.reassigned')
  async handleTaskReassigned(payload: {
    taskId: string;
    previousAssigneeId?: string;
    newAssigneeId: string;
    reassignedById: string;
    reason?: string;
  }) {
    const { taskId, newAssigneeId, reassignedById, reason } = payload;

    try {
      const [reassignedBy, newAssignee] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: reassignedById },
          select: { name: true },
        }),
        this.prisma.user.findUnique({
          where: { id: newAssigneeId },
          select: { name: true },
        }),
      ]);

      const reassignedByName = reassignedBy?.name ?? 'Quản lý';
      const newAssigneeName = newAssignee?.name ?? 'nhân sự mới';

      const content = `${reassignedByName} đã giao lại công việc cho ${newAssigneeName}.${
        reason ? ` Lý do: ${reason}` : ''
      }`;

      await this.prisma.taskComment.create({
        data: {
          taskId,
          authorId: reassignedById,
          content,
          type: CommentType.COMMENT,
          isSystemLog: true,
          mentions: [newAssigneeId],
          links: [],
        },
      });

      this.logger.log(`Tự động ghi nhận bình luận hệ thống giao lại cho task ${taskId}`);
    } catch (error) {
      this.logger.error(`Lỗi khi tạo bình luận hệ thống giao lại cho task ${taskId}:`, error);
    }
  }

  /**
   * Ghi nhận bình luận hệ thống trực tiếp qua API
   */
  async recordSystemLog(
    taskId: string,
    authorId: string,
    action: 'PAUSE' | 'CANCEL' | 'REWORK' | 'REASSIGN',
    reason?: string,
    newAssigneeId?: string,
  ) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('Task không tồn tại');
    }

    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { name: true },
    });
    const authorName = author?.name ?? 'Người dùng';

    let content = '';
    const mentions: string[] = [];

    switch (action) {
      case 'PAUSE':
        content = `${authorName} đã hoãn công việc.${reason ? ` Lý do: ${reason}` : ''}`;
        break;
      case 'CANCEL':
        content = `${authorName} đã hủy công việc.${reason ? ` Lý do: ${reason}` : ''}`;
        break;
      case 'REWORK':
        content = `${authorName} đã yêu cầu làm lại công việc.${reason ? ` Lý do: ${reason}` : ''}`;
        break;
      case 'REASSIGN': {
        let assigneeName = 'nhân sự mới';
        if (newAssigneeId) {
          const assignee = await this.prisma.user.findUnique({
            where: { id: newAssigneeId },
            select: { name: true },
          });
          if (assignee) {
            assigneeName = assignee.name;
            mentions.push(newAssigneeId);
          }
        }
        content = `${authorName} đã giao lại công việc cho ${assigneeName}.${
          reason ? ` Lý do: ${reason}` : ''
        }`;
        break;
      }
    }

    return this.prisma.taskComment.create({
      data: {
        taskId,
        authorId,
        content,
        type: CommentType.COMMENT,
        isSystemLog: true,
        mentions,
        links: [],
      },
      include: {
        author: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
    });
  }
}

