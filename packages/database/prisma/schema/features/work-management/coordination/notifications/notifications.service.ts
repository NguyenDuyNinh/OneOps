import { Injectable, Logger, type OnModuleInit } from "@nestjs/common";
import { NotificationsRepository } from "./notifications.repository.js";
import { NotificationStream } from "./notification-stream.js";
import {
  NotificationEvents,
  type NotificationEvent,
  type NotificationDeleteEvent,
} from "../../../../core/events/notification-events.js";
import type { ListQuery } from "./dto/notifications.dto.js";

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly repository: NotificationsRepository,
    private readonly events: NotificationEvents,
    private readonly stream: NotificationStream,
  ) {}

  onModuleInit() {
    this.events.subscribe((event) => {
      void this.deliver(event).catch((error: unknown) => {
        this.logger.error(
          "Không thể lưu thông báo",
          error instanceof Error ? error.stack : String(error),
        );
      });
    });

    this.events.subscribeDeletion((event) => {
      void this.handleDeletion(event).catch((error: unknown) => {
        this.logger.error(
          "Không thể xóa thông báo theo liên kết",
          error instanceof Error ? error.stack : String(error),
        );
      });
    });
  }

  list(query: ListQuery) {
    return this.repository.list(query);
  }

  get(id: string) {
    return this.repository.get(id);
  }

  markRead(id: string) {
    return this.repository.markRead(id);
  }

  markAllRead(recipient: string) {
    return this.repository.markAllRead(recipient);
  }

  async remove(id: string) {
    const deleted = await this.repository.remove(id);
    this.stream.publishDeleted({
      id: deleted.id,
      recipient: deleted.recipient,
      sourceId: deleted.sourceId,
    });
    return deleted;
  }

  private async handleDeletion(event: NotificationDeleteEvent) {
    const deletedItems = await this.repository.removeBySourceId(
      event.sourceId,
      event.source,
    );
    for (const item of deletedItems) {
      this.stream.publishDeleted({
        id: item.id,
        recipient: item.recipient,
        sourceId: item.sourceId,
      });
    }
  }

  private async deliver(event: NotificationEvent) {
    const recipients = [
      ...new Set(
        event.recipients.map((recipient) => recipient.trim()).filter(Boolean),
      ),
    ];
    for (const recipient of recipients) {
      const notification = await this.repository.create({
        recipient,
        source: event.source,
        title: event.title,
        body: event.body,
        link: event.link,
        sourceId: event.sourceId,
      });
      this.stream.publish(notification);
    }
  }
}
