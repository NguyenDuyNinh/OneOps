import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import { TaskCommentsService } from "./task-comments.service.js";
import {
  createTaskCommentSchema,
  createSystemLogSchema,
  rejectDeadlineProposalSchema,
  listCommentsQuery,
  type CreateTaskCommentInput,
  type CreateSystemLogInput,
  type RejectDeadlineProposalInput,
  type ListCommentsQuery,
} from "./dto/task-comments.dto.js";

@Controller("tasks")
export class TaskCommentsController {
  constructor(private readonly service: TaskCommentsService) {}

  @Get("mentionable-users")
  getMentionableUsers() {
    return this.service.getMentionableUsers();
  }

  @Get(":taskId/comments")
  getComments(
    @Param("taskId") taskId: string,
    @Query(new SchemaPipe(listCommentsQuery)) query: ListCommentsQuery,
  ) {
    return this.service.getComments(taskId, query);
  }

  @Post(":taskId/comments")
  createComment(
    @Param("taskId") taskId: string,
    @Body(new SchemaPipe(createTaskCommentSchema)) dto: CreateTaskCommentInput,
  ) {
    return this.service.createComment(taskId, dto);
  }

  @Get(":taskId/comments/count")
  countComments(@Param("taskId") taskId: string) {
    return this.service.countComments(taskId);
  }

  @Patch(":taskId/comments/:commentId/deadline-proposal/approve")
  approveDeadlineProposal(
    @Param("taskId") taskId: string,
    @Param("commentId") commentId: string,
    @Body() body?: { reviewerId?: string; reviewerName?: string },
  ) {
    return this.service.approveDeadlineProposal(
      taskId,
      commentId,
      body?.reviewerId,
      body?.reviewerName,
    );
  }

  @Patch(":taskId/comments/:commentId/deadline-proposal/reject")
  rejectDeadlineProposal(
    @Param("taskId") taskId: string,
    @Param("commentId") commentId: string,
    @Body(new SchemaPipe(rejectDeadlineProposalSchema))
    dto: RejectDeadlineProposalInput,
  ) {
    return this.service.rejectDeadlineProposal(taskId, commentId, dto);
  }

  @Post(":taskId/comments/system-log")
  recordSystemLog(
    @Param("taskId") taskId: string,
    @Body(new SchemaPipe(createSystemLogSchema)) dto: CreateSystemLogInput,
  ) {
    return this.service.recordSystemLog(taskId, dto);
  }
}
