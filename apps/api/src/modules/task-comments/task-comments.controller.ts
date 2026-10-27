import {
  Body,
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../platform/decorators/current-user.decorator';
import { JwtAuthGuard } from '../platform/guards/jwt-auth.guard';
import type { JwtPayload } from '../platform/types/identity.types';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { RejectDeadlineProposalDto } from './dto/reject-deadline-proposal.dto';
import { CreateSystemLogDto } from './dto/create-system-log.dto';
import { TaskCommentsService } from './task-comments.service';
import type {
  PaginatedTaskComments,
  TaskCommentAuthor,
  TaskCommentItem,
} from './task-comments.types';

@Controller(['tasks', 'api/v1/tasks'])
@UseGuards(JwtAuthGuard)
export class TaskCommentsController {
  constructor(private readonly commentsService: TaskCommentsService) {}

  @Get('mentionable-users')
  async getMentionableUsers(): Promise<TaskCommentAuthor[]> {
    return this.commentsService.getMentionableUsers();
  }

  @Get(':taskId/comments')
  async getComments(
    @Param('taskId') taskId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<PaginatedTaskComments> {
    return this.commentsService.getComments(taskId, { page, limit });
  }

  @Post(':taskId/comments')
  async createComment(
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTaskCommentDto,
  ): Promise<TaskCommentItem> {
    return this.commentsService.createComment(taskId, user.sub, dto);
  }

  @Get(':taskId/comments/count')
  async countComments(
    @Param('taskId') taskId: string,
  ): Promise<{ taskId: string; count: number }> {
    return this.commentsService.countComments(taskId);
  }

  @Patch(':taskId/comments/:commentId/deadline-proposal/approve')
  async approveDeadlineProposal(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new ForbiddenException('Chỉ Quản lý hoặc Quản trị viên mới có quyền duyệt đề xuất Deadline.');
    }
    return this.commentsService.approveDeadlineProposal(taskId, commentId, user.sub);
  }

  @Patch(':taskId/comments/:commentId/deadline-proposal/reject')
  async rejectDeadlineProposal(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RejectDeadlineProposalDto,
  ) {
    if (user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      throw new ForbiddenException('Chỉ Quản lý hoặc Quản trị viên mới có quyền từ chối đề xuất Deadline.');
    }
    return this.commentsService.rejectDeadlineProposal(taskId, commentId, user.sub, dto.reason);
  }

  @Post(':taskId/comments/system-log')
  async recordSystemLog(
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSystemLogDto,
  ) {
    return this.commentsService.recordSystemLog(
      taskId,
      user.sub,
      dto.action,
      dto.reason,
      dto.newAssigneeId,
    );
  }
}

