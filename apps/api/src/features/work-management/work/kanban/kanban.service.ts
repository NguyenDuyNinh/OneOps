import { Injectable } from "@nestjs/common";
import { KanbanRepository } from "./kanban.repository.js";
import type {
  DeadlineState,
  KanbanTaskSnapshot,
} from "./dto/kanban.dto.js";

const eligibleStatuses = new Set([
  "Cần làm",
  "Đang làm",
  "Làm lại",
  "Đang thực hiện",
  "Chờ phản hồi",
]);

@Injectable()
export class KanbanService {
  constructor(private readonly repository: KanbanRepository) {}

  // The current Tasks model stores a date, so its deadline is the end of that
  // calendar day in the application's Asia/Ho_Chi_Minh time zone.
  deadlineOf(date: string) {
    return new Date(`${date}T16:59:59.999Z`);
  }

  deadlineState(task: KanbanTaskSnapshot, now = new Date()): DeadlineState {
    if (!eligibleStatuses.has(task.status)) return "none";
    const remaining = this.deadlineOf(task.date).getTime() - now.getTime();
    if (remaining < 0) return "overdue";
    if (remaining <= 24 * 60 * 60 * 1000) return "due-soon";
    return "normal";
  }

  async reconcile(tasks: KanbanTaskSnapshot[], now = new Date()) {
    for (const task of tasks) {
      await this.repository.recordAlert(
        task.id,
        this.deadlineOf(task.date),
        task.version,
        this.deadlineState(task, now),
      );
    }
    await this.repository.clearMissing(tasks.map((task) => task.id));
  }

  listActiveAlerts() {
    return this.repository.listActive();
  }
}
