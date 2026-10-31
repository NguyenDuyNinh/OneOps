import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from "@nestjs/common";
import { z } from "zod";
import {
  createDepartmentSchema,
  createTeamSchema,
  listQuery,
  updateDepartmentSchema,
  updateTeamSchema,
} from "./dto/departments-teams.dto.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import { DepartmentsTeamsService } from "./departments-teams.service.js";
@Controller("org/departments")
export class DepartmentsController {
  constructor(private readonly service: DepartmentsTeamsService) {}
  @Get() list(
    @Query(new SchemaPipe(listQuery)) query: z.infer<typeof listQuery>,
  ) {
    return this.service.listDepartments(query);
  }
  @Post() create(
    @Body(new SchemaPipe(createDepartmentSchema))
    input: z.infer<typeof createDepartmentSchema>,
  ) {
    return this.service.createDepartment(input);
  }
  @Get(":id") get(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.getDepartment(id);
  }
  @Patch(":id") update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(updateDepartmentSchema))
    input: z.infer<typeof updateDepartmentSchema>,
  ) {
    return this.service.updateDepartment(id, input);
  }
}
@Controller("org/teams")
export class TeamsController {
  constructor(private readonly service: DepartmentsTeamsService) {}
  @Get() list(
    @Query(new SchemaPipe(listQuery)) query: z.infer<typeof listQuery>,
  ) {
    return this.service.listTeams(query);
  }
  @Post() create(
    @Body(new SchemaPipe(createTeamSchema))
    input: z.infer<typeof createTeamSchema>,
  ) {
    return this.service.createTeam(input);
  }
  @Get(":id") get(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.getTeam(id);
  }
  @Patch(":id") update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(updateTeamSchema))
    input: z.infer<typeof updateTeamSchema>,
  ) {
    return this.service.updateTeam(id, input);
  }
}
