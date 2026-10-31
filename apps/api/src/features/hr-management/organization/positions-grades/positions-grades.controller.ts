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
  createGradeSchema,
  createPositionSchema,
  listQuery,
  updateGradeSchema,
  updatePositionSchema,
} from "./dto/positions-grades.dto.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import { PositionsGradesService } from "./positions-grades.service.js";
@Controller("org/positions")
export class PositionsController {
  constructor(private readonly service: PositionsGradesService) {}
  @Get() list(
    @Query(new SchemaPipe(listQuery)) query: z.infer<typeof listQuery>,
  ) {
    return this.service.listPositions(query);
  }
  @Post() create(
    @Body(new SchemaPipe(createPositionSchema))
    input: z.infer<typeof createPositionSchema>,
  ) {
    return this.service.createPosition(input);
  }
  @Get(":id") get(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.getPosition(id);
  }
  @Patch(":id") update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(updatePositionSchema))
    input: z.infer<typeof updatePositionSchema>,
  ) {
    return this.service.updatePosition(id, input);
  }
}
@Controller("org/grades")
export class GradesController {
  constructor(private readonly service: PositionsGradesService) {}
  @Get() list(
    @Query(new SchemaPipe(listQuery)) query: z.infer<typeof listQuery>,
  ) {
    return this.service.listGrades(query);
  }
  @Post() create(
    @Body(new SchemaPipe(createGradeSchema))
    input: z.infer<typeof createGradeSchema>,
  ) {
    return this.service.createGrade(input);
  }
  @Get(":id") get(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.getGrade(id);
  }
  @Patch(":id") update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(updateGradeSchema))
    input: z.infer<typeof updateGradeSchema>,
  ) {
    return this.service.updateGrade(id, input);
  }
}
