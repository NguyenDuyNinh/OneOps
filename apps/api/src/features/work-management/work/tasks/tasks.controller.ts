import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from "@nestjs/common";
import { z } from "zod";
import {
  validatedCreateSchema as createSchema,
  updateSchema,
} from "./dto/tasks.dto.js";
import { listQuery, versionSchema } from "./dto/tasks.dto.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import { RequirePermission } from "../../../../core/auth/actor-context.js";
import { TasksService } from "./tasks.service.js";
@Controller("tasks")
export class TasksController {
  constructor(private readonly service: TasksService) {}
  @Get()
  @RequirePermission("work-management/work/tasks", "view")
  list(@Query(new SchemaPipe(listQuery)) query: z.infer<typeof listQuery>) {
    return this.service.list(query);
  }
  @Post() create(
    @Body(new SchemaPipe(createSchema)) input: z.infer<typeof createSchema>,
  ) {
    return this.service.create(input);
  }
  @Get(":id")
  @RequirePermission("work-management/work/tasks", "view")
  get(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.get(id);
  }
  @Patch(":id") update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(updateSchema)) input: z.infer<typeof updateSchema>,
  ) {
    return this.service.update(id, input);
  }
  @Delete(":id") remove(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(versionSchema)) input: z.infer<typeof versionSchema>,
  ) {
    return this.service.remove(id, input.version);
  }
}
