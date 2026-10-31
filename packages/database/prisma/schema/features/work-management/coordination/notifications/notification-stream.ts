import { Injectable, type MessageEvent } from "@nestjs/common";
import { Subject, filter, interval, map, merge, type Observable } from "rxjs";
import type { RecordDto } from "./dto/notifications.dto.js";

export interface DeletedPayload {
  id: string;
  recipient: string;
  sourceId: string | null;
}

@Injectable()
export class NotificationStream {
  private readonly events = new Subject<RecordDto>();
  private readonly deletedEvents = new Subject<DeletedPayload>();

  publish(notification: RecordDto) {
    this.events.next(notification);
  }

  publishDeleted(payload: DeletedPayload) {
    this.deletedEvents.next(payload);
  }

  stream(recipient: string): Observable<MessageEvent> {
    return merge(
      this.events.pipe(
        filter((notification) => notification.recipient === recipient),
        map((notification) => ({ type: "notification", data: notification })),
      ),
      this.deletedEvents.pipe(
        filter((payload) => payload.recipient === recipient),
        map((payload) => ({ type: "notification_deleted", data: payload })),
      ),
      interval(25_000).pipe(map(() => ({ type: "ping", data: "" }))),
    );
  }
}
