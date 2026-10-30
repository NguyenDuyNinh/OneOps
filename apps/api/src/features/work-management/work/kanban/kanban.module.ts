import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../../core/database/database.module.js";
import { KanbanRepository } from "./kanban.repository.js";
import { KanbanService } from "./kanban.service.js";

@Module({
  imports: [DatabaseModule],
  providers: [KanbanRepository, KanbanService],
  exports: [KanbanService],
})
export class KanbanModule {}
