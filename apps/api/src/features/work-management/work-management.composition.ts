import { Injectable, NotFoundException } from "@nestjs/common";
import {
  MilestonesQaService,
  type QaTaskRefPort,
  type QaTaskSnapshot,
} from "./projects/milestones-qa/index.js";
import {
  type TimesheetTaskRefPort,
  type TimesheetTaskSnapshot,
} from "./projects/timesheets/index.js";
import { TaskCommentsService } from "./work/task-comments/index.js";
import type { TaskSnapshotPort } from "./work/task-comments/index.js";
import { TasksService, taskStatusSchema } from "./work/tasks/index.js";
import type { TaskCommentSinkPort } from "./work/task-workflow/index.js";
import type {
  QaGatePort,
  QaGateStatus,
  TaskStatePort,
  TaskStateSnapshot,
} from "./work/task-workflow/index.js";

/** The only shape these adapters need from a task row. */
interface TaskView {
  id: string;
  code: string;
  name: string;
  status: string;
  date: string;
  assignee: string;
  reviewer: string;
}

const view = (task: TaskView) => ({
  id: task.id,
  code: task.code,
  name: task.name,
  status: task.status,
  assignee: task.assignee,
  reviewer: task.reviewer,
});

/**
 * Composition adapters for the work-management domain. Each one implements a
 * port declared by a leaf feature and calls the public service of another leaf,
 * so no feature imports its sibling.
 */
@Injectable()
export class TaskStateComposition implements TaskStatePort {
  constructor(private readonly tasks: TasksService) {}

  async get(taskId: string): Promise<TaskStateSnapshot> {
    return this.snapshot(await this.tasks.get(taskId));
  }

  async transition(
    taskId: string,
    input: { toStatus: string; version: number },
  ): Promise<TaskStateSnapshot> {
    return this.snapshot(
      await this.tasks.applyStatus(
        taskId,
        taskStatusSchema.parse(input.toStatus),
        input.version,
      ),
    );
  }

  async setDeadline(
    taskId: string,
    input: { date: string; version: number },
  ): Promise<TaskStateSnapshot> {
    return this.snapshot(
      await this.tasks.setDeadline(taskId, input.date, input.version),
    );
  }

  private snapshot(task: TaskView & { version: number }): TaskStateSnapshot {
    return { ...view(task), date: task.date, version: task.version };
  }
}

@Injectable()
export class TaskCommentSinkComposition implements TaskCommentSinkPort {
  constructor(private readonly comments: TaskCommentsService) {}

  async record(input: {
    taskId: string;
    author: string;
    body: string;
  }): Promise<void> {
    await this.comments.record(input);
  }
}

@Injectable()
export class TaskSnapshotComposition implements TaskSnapshotPort {
  constructor(private readonly tasks: TasksService) {}

  async get(taskId: string) {
    return view(await this.tasks.get(taskId));
  }
}

@Injectable()
export class QaGateComposition implements QaGatePort {
  constructor(private readonly qa: MilestonesQaService) {}

  async inspect(taskId: string): Promise<QaGateStatus> {
    return this.qa.gate(taskId);
  }
}

@Injectable()
export class QaTaskRefComposition implements QaTaskRefPort {
  constructor(private readonly tasks: TasksService) {}

  async snapshots(taskIds: readonly string[]): Promise<QaTaskSnapshot[]> {
    if (!taskIds.length) return [];
    const items: QaTaskSnapshot[] = [];
    for (let page = 1; page <= Math.ceil(taskIds.length / 100); page++) {
      const result = await this.tasks.list({
        page,
        pageSize: 100,
        ids: taskIds.join(","),
      });
      items.push(...result.items.map((task) => view(task)));
    }
    return items;
  }
}

@Injectable()
export class TimesheetTaskRefComposition implements TimesheetTaskRefPort {
  constructor(private readonly tasks: TasksService) {}

  async snapshot(taskId: string): Promise<TimesheetTaskSnapshot | null> {
    try {
      return view(await this.tasks.get(taskId));
    } catch (error) {
      if (error instanceof NotFoundException) return null;
      throw error;
    }
  }
}
