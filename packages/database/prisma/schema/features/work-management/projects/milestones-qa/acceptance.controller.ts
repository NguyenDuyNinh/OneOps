import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
  acceptanceQuery,
  createAcceptanceSchema,
  resultInput,
  updateAcceptanceSchema,
  versionSchema,
} from "./dto/milestones-qa.dto.js";
import { MilestonesQaService } from "./milestones-qa.service.js";

const FEATURE = "work-management/projects/milestones-qa";

@Controller("acceptance")
export class AcceptanceController {
  constructor(private readonly service: MilestonesQaService) {}

  @Get()
  @RequirePermission(FEATURE, "view")
  list(
    @Query(new SchemaPipe(acceptanceQuery))
    query: z.infer<typeof acceptanceQuery>,
  ) {
    return this.service.acceptance(query.taskId);
  }

  @Post()
  create(
    @Body(new SchemaPipe(createAcceptanceSchema))
    input: z.infer<typeof createAcceptanceSchema>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.createAcceptance(input, actor);
  }

  @Patch(":id")
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(updateAcceptanceSchema))
    input: z.infer<typeof updateAcceptanceSchema>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.updateAcceptance(id, input, actor);
  }

  @Delete(":id")
  remove(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(versionSchema)) input: z.infer<typeof versionSchema>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.removeAcceptance(id, input.version, actor);
  }

  @Get(":id/results")
  @RequirePermission(FEATURE, "view")
  results(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.results(id);
  }

  @Post(":id/results")
  record(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(resultInput)) input: z.infer<typeof resultInput>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.recordResult(id, input, actor);
  }
}
