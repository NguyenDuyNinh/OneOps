import { Injectable } from "@nestjs/common";
import { TasksService } from "./work/tasks/index.js";
import {
  KanbanService,
  type KanbanQuery,
  type KanbanBoardResponse,
} from "./work/kanban/index.js";

const statuses = [
  "Cần làm",
  "Đang làm",
  "Làm lại",
  "Chờ kiểm tra",
  "Hoãn lại",
  "Hoàn thành",
  "Đang thực hiện",
  "Chờ phản hồi",
  "Đã hủy",
] as const;

@Injectable()
export class WorkManagementKanbanService {
  constructor(
    private readonly tasks: TasksService,
    private readonly kanban: KanbanService,
  ) {}

  async allTasks() {
    const first = await this.tasks.list({ page: 1, pageSize: 100 });
    const items = [...first.items];
    for (let page = 2; items.length < first.total; page++) {
      const next = await this.tasks.list({ page, pageSize: 100 });
      items.push(...next.items);
      if (!next.items.length) break;
    }
    return items;
  }

  async board(query: KanbanQuery): Promise<KanbanBoardResponse> {
    const now = new Date();
    const tasks = await this.allTasks();
    const visible = tasks.filter((task) => {
      if (!query.includeCancelled && task.status === "Đã hủy") return false;
      if (query.assignee !== undefined && task.assignee !== query.assignee)
        return false;
      if (query.status && task.status !== query.status) return false;
      if (query.deadlineFrom && task.date < query.deadlineFrom) return false;
      if (query.deadlineTo && task.date > query.deadlineTo) return false;
      if (
        query.deadlineState &&
        this.kanban.deadlineState(task, now) !== query.deadlineState
      )
        return false;
      return true;
    });
    const cards = visible.map((task) => ({
      id: task.id,
      code: task.code,
      name: task.name,
      assignee: task.assignee,
      deadline: this.kanban.deadlineOf(task.date).toISOString(),
      status: task.status,
      deadlineState: this.kanban.deadlineState(task, now),
      commentCount: task.fields.comments?.length ?? 0,
      version: task.version,
    }));
    const rank = { overdue: 0, "due-soon": 1, normal: 2, none: 3 };
    cards.sort(
      (a, b) =>
        rank[a.deadlineState] - rank[b.deadlineState] ||
        a.deadline.localeCompare(b.deadline) ||
        a.id.localeCompare(b.id),
    );
    const eligible = cards.filter((card) => card.status !== "Đã hủy");
    const completed = eligible.filter(
      (card) => card.status === "Hoàn thành",
    ).length;
    const start = (query.page - 1) * query.pageSize;
    const pageItems = cards.slice(start, start + query.pageSize);
    return {
      summary: {
        total: eligible.length,
        completionRate: eligible.length
          ? Math.round((completed / eligible.length) * 100)
          : 0,
        awaitingReview: eligible.filter(
          (card) => card.status === "Chờ kiểm tra",
        ).length,
        paused: eligible.filter((card) => card.status === "Hoãn lại").length,
        dueSoon: eligible.filter(
          (card) => card.deadlineState === "due-soon",
        ).length,
        overdue: eligible.filter(
          (card) => card.deadlineState === "overdue",
        ).length,
      },
      lanes: statuses
        .filter((status) => query.includeCancelled || status !== "Đã hủy")
        .map((status) => ({
          status,
          count: cards.filter((card) => card.status === status).length,
          items: pageItems.filter((card) => card.status === status),
        })),
      total: cards.length,
      page: query.page,
      pageSize: query.pageSize,
      generatedAt: now.toISOString(),
    };
  }

  async reconcileAlerts() {
    await this.kanban.reconcile(await this.allTasks());
  }
}
