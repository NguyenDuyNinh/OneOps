import { Module } from "@nestjs/common";
import {
  GradesController,
  PositionsController,
} from "./positions-grades.controller.js";
import { PositionsGradesRepository } from "./positions-grades.repository.js";
import { PositionsGradesService } from "./positions-grades.service.js";
@Module({
  controllers: [PositionsController, GradesController],
  providers: [PositionsGradesRepository, PositionsGradesService],
  exports: [PositionsGradesService],
})
export class PositionsGradesModule {}
