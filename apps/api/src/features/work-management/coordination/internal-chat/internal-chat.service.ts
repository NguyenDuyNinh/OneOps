import { createSchema, updateSchema } from "./dto/internal-chat.dto.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import { Injectable } from "@nestjs/common";
import { InternalChatRepository } from "./internal-chat.repository.js";
import {
  NotificationEvents,
  parseRecipients,
} from "../../../../core/events/notification-events.js";
import type { RecordInput } from "./dto/internal-chat.dto.js";
import type { Transaction } from "../../../../core/database/database.module.js";
import type { ListQuery } from "./dto/internal-chat.dto.js";
@Injectable()
export class InternalChatService {
  constructor(
    private readonly repository: InternalChatRepository,
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
    const recipients = parseRecipients(
      created.assignee,
      created.fields.participants ?? "",
    );
    if (recipients.length)
      this.events.emit({
        source: "message",
        recipients,
        title: `Tin nhắn mới: ${created.name}`.slice(0, 500),
        body: `Chủ đề ${created.code} vừa có tin nhắn mới.`,
        link: `/work-management/internal-chat?thread=${created.id}`,
        sourceId: created.id,
      });
    return created;
  }
  update(
    id: string,
    input: Partial<RecordInput> & { version: number },
    tx?: Transaction,
  ) {
    return this.repository.update(
      id,
      new SchemaPipe(updateSchema).transform(input),
      tx,
    );
  }
  async remove(id: string, version: number, tx?: Transaction) {
    const result = await this.repository.remove(id, version, tx);
    this.events.emitDeletion({ sourceId: id, source: "message" });
    return result;
  }
}
