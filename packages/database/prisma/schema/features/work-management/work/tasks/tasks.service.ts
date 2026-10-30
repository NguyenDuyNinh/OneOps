import {
  validatedCreateSchema as createSchema,
  updateSchema,
} from "./dto/tasks.dto.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import { Injectable } from "@nestjs/common";
import { TasksRepository } from "./tasks.repository.js";
import {
  NotificationEvents,
  parseRecipients,
} from "../../../../core/events/notification-events.js";
import type { RecordInput } from "./dto/tasks.dto.js";
import type { Transaction } from "../../../../core/database/database.module.js";
import type { ListQuery } from "./dto/tasks.dto.js";

@Injectable()
export class TasksService {
  constructor(
    private readonly repository: TasksRepository,
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
    if (created.assignee)
      this.events.emit({
        source: "task",
        recipients: [created.assignee],
        title: `Công việc mới: ${created.name}`.slice(0, 500),
        body: `Bạn được giao công việc ${created.code}.`,
        link: `/work-management/tasks?focus=${created.id}`,
        sourceId: created.id,
      });
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
    const updated = await this.repository.update(id, patch, tx);
    const link = `/work-management/tasks?focus=${updated.id}`;

    const currentNguoiKiemTra = current.fields.nguoiKiemTra;
    const updatedNguoiKiemTra = updated.fields.nguoiKiemTra;

    // Giao lại task: assignee thay đổi
    if (updated.assignee && updated.assignee !== current.assignee)
      this.events.emit({
        source: "task",
        recipients: [updated.assignee],
        title: `Công việc được giao: ${updated.name}`.slice(0, 500),
        body: `Bạn được giao công việc ${updated.code}.`,
        link,
        sourceId: updated.id,
      });

    // Người kiểm tra thay đổi
    if (updatedNguoiKiemTra && updatedNguoiKiemTra !== currentNguoiKiemTra)
      this.events.emit({
        source: "task",
        recipients: [updatedNguoiKiemTra],
        title: `Nhiệm vụ kiểm tra mới: ${updated.name}`.slice(0, 500),
        body: `Bạn được chỉ định làm Người kiểm tra cho công việc ${updated.code}.`,
        link,
        sourceId: updated.id,
      });

    // Trạng thái thay đổi
    if (updated.status !== current.status) {
      // Nộp kiểm tra: thông báo Người kiểm tra
      if (updated.status === "Chờ phản hồi" && updatedNguoiKiemTra)
        this.events.emit({
          source: "task",
          recipients: [updatedNguoiKiemTra],
          title: `Task cần kiểm tra: ${updated.name}`.slice(0, 500),
          body: `${updated.assignee} đã nộp công việc ${updated.code} để kiểm tra.`,
          link,
          sourceId: updated.id,
        });
      else if (updated.assignee)
        this.events.emit({
          source: "task",
          recipients: [updated.assignee],
          title:
            updated.status === "Hoàn thành"
              ? `Kết quả kiểm tra: ${updated.name}`.slice(0, 500)
              : `Cập nhật trạng thái: ${updated.name}`.slice(0, 500),
          body: `Công việc ${updated.code} đã được chuyển thành ${updated.status}.`,
          link,
          sourceId: updated.id,
        });
    }

    // Deadline thay đổi
    if (updated.date !== current.date) {
      this.events.emit({
        source: "task",
        recipients: parseRecipients(
          updated.assignee,
          ...(updatedNguoiKiemTra ? [updatedNguoiKiemTra] : []),
        ),
        title: `Deadline đã thay đổi: ${updated.name}`.slice(0, 500),
        body: `Hạn hoàn thành của công việc ${updated.code} đã được cập nhật.`,
        link,
        sourceId: updated.id,
      });
    }

    // Bình luận mới: thông báo assignee và @mention
    const previousComments = new Set(
      (current.fields.comments ?? []).map((comment) => comment.id),
    );
    for (const comment of updated.fields.comments ?? []) {
      if (
        !updated.assignee ||
        previousComments.has(comment.id) ||
        comment.author === updated.assignee
      )
        continue;
      this.events.emit({
        source: "comment",
        recipients: [updated.assignee],
        title: `Bình luận mới: ${updated.name}`.slice(0, 500),
        body: `${comment.author}: ${comment.text}`.slice(0, 2000),
        link,
        sourceId: updated.id,
      });
      // @mention: gửi thông báo cho người được nhắc tên
      const mentions = comment.text.match(/@(\S+)/g);
      if (mentions) {
        const mentioned = mentions.map((m) => m.slice(1));
        this.events.emit({
          source: "comment",
          recipients: mentioned,
          title: `Bạn được nhắc tên: ${updated.name}`.slice(0, 500),
          body: `${comment.author} đã nhắc bạn trong bình luận của công việc ${updated.code}.`,
          link,
          sourceId: updated.id,
        });
      }
    }

    return updated;
  }

  async remove(id: string, version: number, tx?: Transaction) {
    const result = await this.repository.remove(id, version, tx);
    this.events.emitDeletion({ sourceId: id });
    return result;
  }
}
