import {
  validatedCreateSchema as createSchema,
  updateSchema,
} from "./dto/calendar.dto.js";
import { SchemaPipe } from "../../../../../core/pipes/validation.pipe.js";
import { Injectable } from "@nestjs/common";
import { CalendarRepository } from "./calendar.repository.js";
import {
  NotificationEvents,
  parseRecipients,
} from "../../../../../core/events/notification-events.js";
import type { RecordInput } from "./dto/calendar.dto.js";
import type { Transaction } from "../../../../../core/database/database.module.js";
import type { ListQuery } from "./dto/calendar.dto.js";
@Injectable()
export class CalendarService {
  constructor(
    private readonly repository: CalendarRepository,
    private readonly events: NotificationEvents,
  ) {}
  list(query: ListQuery) {
    return this.repository.list(query);
  }
  get(id: string, tx?: Transaction) {
    return this.repository.get(id, tx);
  }
  async create(input: RecordInput, tx?: Transaction) {
    const created = await this.repository.create(
      new SchemaPipe(createSchema).transform(input),
      tx,
    );
    if (created.fields.kind === "Cuộc họp") {
      const recipients = parseRecipients(
        created.assignee,
        created.fields.attendees ?? "",
      );
      const time = created.fields.startTime
        ? `${created.fields.startTime}${created.fields.endTime ? `-${created.fields.endTime}` : ""}`
        : "";
      if (recipients.length)
        this.events.emit({
          source: "meeting",
          recipients,
          title: `Cuộc họp mới: ${created.name}`.slice(0, 500),
          body: [created.date, time].filter(Boolean).join(" "),
          link: `/work-management/calendar?event=${created.id}`,
          sourceId: created.id,
        });
    }
    return created;
  }
  async update(
    id: string,
    input: Partial<RecordInput> & { version: number },
    tx?: Transaction,
  ) {
    const patch = new SchemaPipe(updateSchema).transform(input);
    const current = await this.repository.get(id, tx);
    new SchemaPipe(createSchema).transform({
      code: current.code,
      name: current.name,
      status: current.status,
      date: current.date,
      scope: current.scope,
      assignee: current.assignee,
      note: current.note,
      fields: current.fields,
      ...Object.fromEntries(
        Object.entries(patch).filter(([key]) => key !== "version"),
      ),
    });
    return this.repository.update(id, patch, tx);
  }
  async remove(id: string, version: number, tx?: Transaction) {
    const result = await this.repository.remove(id, version, tx);
    this.events.emitDeletion({ sourceId: id, source: "meeting" });
    return result;
  }
}
