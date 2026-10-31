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
  createEmployeeSchema,
  listQuery,
  updateEmployeeSchema,
} from "./dto/employee-directory.dto.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import { EmployeeDirectoryService } from "./employee-directory.service.js";
@Controller("employees")
export class EmployeeDirectoryController {
  constructor(private readonly service: EmployeeDirectoryService) {}
  @Get() list(
    @Query(new SchemaPipe(listQuery)) query: z.infer<typeof listQuery>,
  ) {
    return this.service.list(query);
  }
  @Post() create(
    @Body(new SchemaPipe(createEmployeeSchema))
    input: z.infer<typeof createEmployeeSchema>,
  ) {
    return this.service.create(input);
  }
  @Get(":id") get(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.get(id);
  }
  @Patch(":id") update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(updateEmployeeSchema))
    input: z.infer<typeof updateEmployeeSchema>,
  ) {
    return this.service.update(id, input);
  }
}
