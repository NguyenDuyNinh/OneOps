import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from "@nestjs/common";
import { z } from "zod";
import {
  CurrentActor,
  RequirePermission,
  type ActorContext,
} from "../../../../core/auth/actor-context.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  allowedQuery,
  decisionInput,
  proposalInput,
  proposalQuery,
  transitionInput,
} from "./dto/task-workflow.dto.js";
import { TaskWorkflowService } from "./task-workflow.service.js";

@Controller("task-workflow")
export class TaskWorkflowController {
  constructor(private readonly service: TaskWorkflowService) {}

  @Get("rules")
  rules() {
    return this.service.rules();
  }

  @Get("allowed")
  @RequirePermission("work-management/work/task-workflow", "view")
  allowed(
    @Query(new SchemaPipe(allowedQuery)) query: z.infer<typeof allowedQuery>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.allowed(query.taskIds, actor);
  }

  @Get("tasks/:taskId/state")
  @RequirePermission("work-management/work/task-workflow", "view")
  state(
    @Param("taskId", new ParseUUIDPipe()) taskId: string,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.state(taskId, actor);
  }

  @Get("tasks/:taskId/history")
  @RequirePermission("work-management/work/task-workflow", "view")
  history(@Param("taskId", new ParseUUIDPipe()) taskId: string) {
    return this.service.history(taskId);
  }

  @Post("tasks/:taskId/transitions")
  @HttpCode(200)
  transition(
    @Param("taskId", new ParseUUIDPipe()) taskId: string,
    @Body(new SchemaPipe(transitionInput))
    input: z.infer<typeof transitionInput>,
    @CurrentActor() actor: ActorContext,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    return this.service.transition(taskId, input, actor, idempotencyKey);
  }

  @Get("proposals")
  @RequirePermission("work-management/work/task-workflow", "view")
  proposals(
    @Query(new SchemaPipe(proposalQuery)) query: z.infer<typeof proposalQuery>,
  ) {
    return this.service.proposals(query);
  }

  @Post("tasks/:taskId/proposals")
  propose(
    @Param("taskId", new ParseUUIDPipe()) taskId: string,
    @Body(new SchemaPipe(proposalInput)) input: z.infer<typeof proposalInput>,
    @CurrentActor() actor: ActorContext,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    return this.service.propose(taskId, input, actor, idempotencyKey);
  }

  @Post("proposals/:id/decision")
  @HttpCode(200)
  decide(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(decisionInput)) input: z.infer<typeof decisionInput>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.decide(id, input, actor);
  }
}
