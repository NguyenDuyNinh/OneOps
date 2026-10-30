import { Module } from "@nestjs/common";
import { TasksModule } from "./work/tasks/index.js";
import {
  KanbanController,
  KanbanModule,
  KANBAN_BOARD_READER,
} from "./work/kanban/index.js";
import { WorkManagementKanbanService } from "./work-management.kanban.service.js";
import { WorkManagementKanbanScheduler } from "./work-management.kanban.scheduler.js";

@Module({
  imports: [TasksModule, KanbanModule],
  controllers: [KanbanController],
  providers: [
    WorkManagementKanbanService,
    WorkManagementKanbanScheduler,
    { provide: KANBAN_BOARD_READER, useExisting: WorkManagementKanbanService },
  ],
})
export class WorkManagementKanbanModule {}
