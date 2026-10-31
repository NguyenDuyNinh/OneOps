import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../../core/database/database.module.js";
import { DepartmentsTeamsRepository } from "./departments-teams.repository.js";
import { DepartmentsTeamsService } from "./departments-teams.service.js";
import {
  DepartmentsController,
  TeamsController,
} from "./departments-teams.controller.js";
@Module({
  imports: [DatabaseModule],
  exports: [DepartmentsTeamsService],
  controllers: [DepartmentsController, TeamsController],
  providers: [DepartmentsTeamsRepository, DepartmentsTeamsService],
})
export class DepartmentsTeamsModule {}
