import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { z } from "zod";
import {
  CurrentActor,
  RequirePermission,
  type ActorContext,
} from "../../../../core/auth/actor-context.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  commentInput,
  countsQuery,
  listQuery,
} from "./dto/task-comments.dto.js";
import { TaskCommentsService } from "./task-comments.service.js";

@Controller("task-comments")
export class TaskCommentsController {
  constructor(private readonly service: TaskCommentsService) {}

  @Get()
  @RequirePermission("work-management/work/task-comments", "view")
  list(@Query(new SchemaPipe(listQuery)) query: z.infer<typeof listQuery>) {
    return this.service.list(query);
  }

  @Get("counts")
  @RequirePermission("work-management/work/task-comments", "view")
  counts(
    @Query(new SchemaPipe(countsQuery)) query: z.infer<typeof countsQuery>,
  ) {
    return this.service.counts(query.taskIds);
  }

  @Post()
  create(
    @Body(new SchemaPipe(commentInput)) input: z.infer<typeof commentInput>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.create(input, actor);
  }
}
