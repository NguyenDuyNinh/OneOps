import { Injectable } from "@nestjs/common";
import { Database } from "../../../../core/database/database.module.js";
import type { DeadlineState } from "./dto/kanban.dto.js";

@Injectable()
export class KanbanRepository {
  constructor(private readonly db: Database) {}

  async recordAlert(
    taskId: string,
    deadline: Date,
    taskVersion: number,
    state: DeadlineState,
  ) {
    const existing = await this.db.kanbanAlert.findUnique({
      where: { taskId },
    });
    const changed =
      !existing ||
      existing.deadlineSnapshot.getTime() !== deadline.getTime() ||
      existing.state !== state;
    return this.db.kanbanAlert.upsert({
      where: { taskId },
      create: {
        taskId,
        deadlineSnapshot: deadline,
        taskVersion,
        state,
      },
      update: {
        deadlineSnapshot: deadline,
        taskVersion,
        state,
        checkedAt: new Date(),
        ...(changed ? { changedAt: new Date() } : {}),
      },
    });
  }

  async listActive() {
    return this.db.kanbanAlert.findMany({
      where: { state: { in: ["due-soon", "overdue"] } },
      orderBy: [{ changedAt: "desc" }, { taskId: "asc" }],
    });
  }

  async clearMissing(taskIds: string[]) {
    await this.db.kanbanAlert.updateMany({
      where: {
        taskId: { notIn: taskIds },
        state: { not: "none" },
      },
      data: { state: "none", changedAt: new Date(), checkedAt: new Date() },
    });
  }
}
