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
import { RequirePermission } from "../../../../core/auth/actor-context.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  createMilestoneSchema,
  linkTasksSchema,
  milestoneListQuery,
  updateMilestoneSchema,
} from "./dto/milestones-qa.dto.js";
import { MilestonesQaService } from "./milestones-qa.service.js";

const FEATURE = "work-management/projects/milestones-qa";

@Controller("milestones")
export class MilestonesQaController {
  constructor(private readonly service: MilestonesQaService) {}

  @Get("rules")
  @RequirePermission(FEATURE, "view")
  rules() {
    return this.service.rules();
  }

  @Get()
  @RequirePermission(FEATURE, "view")
  list(
    @Query(new SchemaPipe(milestoneListQuery))
    query: z.infer<typeof milestoneListQuery>,
  ) {
    return this.service.list(query);
  }

  @Post()
  @RequirePermission(FEATURE, "create")
  create(
    @Body(new SchemaPipe(createMilestoneSchema))
    input: z.infer<typeof createMilestoneSchema>,
  ) {
    return this.service.create(input);
  }

  @Get(":id")
  @RequirePermission(FEATURE, "view")
  get(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.get(id);
  }

  @Patch(":id")
  @RequirePermission(FEATURE, "update")
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(updateMilestoneSchema))
    input: z.infer<typeof updateMilestoneSchema>,
  ) {
    return this.service.update(id, input);
  }

  @Post(":id/items")
  @RequirePermission(FEATURE, "update")
  link(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(linkTasksSchema))
    input: z.infer<typeof linkTasksSchema>,
  ) {
    return this.service.link(id, input.taskIds);
  }

  @Delete(":id/items/:taskId")
  @RequirePermission(FEATURE, "update")
  unlink(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Param("taskId", new ParseUUIDPipe()) taskId: string,
  ) {
    return this.service.unlink(id, taskId);
  }
}
