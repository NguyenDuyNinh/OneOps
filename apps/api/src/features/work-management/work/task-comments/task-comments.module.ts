import { Module, type DynamicModule, type Type } from "@nestjs/common";
import { DatabaseModule } from "../../../../core/database/database.module.js";
import { TASK_SNAPSHOT, type TaskSnapshotPort } from "./task-snapshot.port.js";
import { TaskCommentsController } from "./task-comments.controller.js";
import { TaskCommentsRepository } from "./task-comments.repository.js";
import { TaskCommentsService } from "./task-comments.service.js";

/** The task read model is supplied by the main composition. */
@Module({})
export class TaskCommentsModule {
  static forRoot(options: {
    tasks: Type<TaskSnapshotPort>;
    imports?: DynamicModule["imports"];
  }): DynamicModule {
    return {
      module: TaskCommentsModule,
      imports: [DatabaseModule, ...(options.imports ?? [])],
      controllers: [TaskCommentsController],
      providers: [
        TaskCommentsRepository,
        TaskCommentsService,
        { provide: TASK_SNAPSHOT, useClass: options.tasks },
      ],
      exports: [TaskCommentsService],
    };
  }
}
