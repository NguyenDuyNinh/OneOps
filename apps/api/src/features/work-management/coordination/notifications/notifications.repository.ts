import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Database,
  type Transaction,
} from "../../../../core/database/database.module.js";
import { Prisma, type WorkNotification } from "@oneops/database";
import { createSchema, recordSchema } from "./dto/notifications.dto.js";
import type {
  CreateInput,
  RecordDto,
  ListQuery,
} from "./dto/notifications.dto.js";

@Injectable()
export class NotificationsRepository {
  constructor(private readonly db: Database) {}

  private table(tx: Transaction = this.db) {
    return tx.workNotification;
  }

  private dto(row: WorkNotification): RecordDto {
    return recordSchema.parse({
      id: row.id,
      recipient: row.recipient,
      source: row.source,
      title: row.title,
      body: row.body,
      link: row.link,
      sourceId: row.sourceId,
      readAt: row.readAt?.toISOString() ?? null,
      deletedAt: row.deletedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    });
  }

  async get(id: string) {
    const row = await this.table().findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy thông báo.");
    return this.dto(row);
  }

  async list(query: ListQuery) {
    const where: Prisma.WorkNotificationWhereInput = {
      recipient: query.recipient,
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.unread ? { readAt: null } : {}),
    };
    return this.db.$transaction(
      async (tx) => ({
        items: (
          await this.table(tx).findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
          })
        ).map((row) => this.dto(row)),
        total: await this.table(tx).count({ where }),
        unread: await this.table(tx).count({
          where: {
            recipient: query.recipient,
            readAt: null,
            ...(query.includeDeleted ? {} : { deletedAt: null }),
          },
        }),
        page: query.page,
        pageSize: query.pageSize,
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async create(input: CreateInput) {
    return this.dto(
      await this.table().create({ data: createSchema.parse(input) }),
    );
  }

  async markRead(id: string) {
    const row = await this.table().findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy thông báo.");
    if (row.readAt) return this.dto(row);
    return this.dto(
      await this.table().update({
        where: { id },
        data: { readAt: new Date() },
      }),
    );
  }

  async markAllRead(recipient: string) {
    const result = await this.table().updateMany({
      where: { recipient, readAt: null, deletedAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  // Soft delete: lưu lại trong DB để đối soát/kiểm tra, chỉ ẩn trên giao diện
  async remove(id: string) {
    const row = await this.table().findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy thông báo.");
    return this.dto(
      await this.table().update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
    );
  }

  // Soft delete hàng loạt khi thực thể gốc (task, calendar, chat) bị xóa
  async removeBySourceId(sourceId: string, source?: string) {
    const where: Prisma.WorkNotificationWhereInput = {
      sourceId,
      ...(source ? { source } : {}),
      deletedAt: null,
    };
    const items = await this.table().findMany({ where });
    if (items.length === 0) return [];
    const now = new Date();
    await this.table().updateMany({
      where,
      data: { deletedAt: now },
    });
    return items.map((row) => this.dto({ ...row, deletedAt: now }));
  }
}
