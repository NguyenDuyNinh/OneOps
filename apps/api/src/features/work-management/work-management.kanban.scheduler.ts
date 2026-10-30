import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { WorkManagementKanbanService } from "./work-management.kanban.service.js";

@Injectable()
export class WorkManagementKanbanScheduler
  implements OnModuleInit, OnModuleDestroy
{
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly logger = new Logger(WorkManagementKanbanScheduler.name);

  constructor(private readonly service: WorkManagementKanbanService) {}

  onModuleInit() {
    if (process.env.NODE_ENV === "test") return;
    this.timer = setInterval(() => void this.tick(), 60_000);
    this.timer.unref();
    void this.tick();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick() {
    if (this.running) return;
    this.running = true;
    try {
      await this.service.reconcileAlerts();
    } catch (error) {
      this.logger.error("Kanban alert reconciliation failed", error);
    } finally {
      this.running = false;
    }
  }
}
