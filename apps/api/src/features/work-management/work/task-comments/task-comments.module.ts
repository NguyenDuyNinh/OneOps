import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../../core/database/database.module.js";
import { TaskCommentsRepository } from "./task-comments.repository.js";
import { TaskCommentsService } from "./task-comments.service.js";
import { TaskCommentsController } from "./task-comments.controller.js";

@Module({
  imports: [DatabaseModule],
  controllers: [TaskCommentsController],
  providers: [TaskCommentsRepository, TaskCommentsService],
  exports: [TaskCommentsService, TaskCommentsRepository],
})
export class TaskCommentsModule {}
