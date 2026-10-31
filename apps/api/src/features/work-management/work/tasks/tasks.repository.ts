import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {
  Database,
  type Transaction,
} from "../../../../core/database/database.module.js";
import { Prisma, type WorkTask } from "@oneops/database";
import {
  INITIAL_TASK_STATUS,
  recordSchema,
  type TaskStatus,
} from "./dto/tasks.dto.js";
import type { RecordInput, RecordDto, ListQuery } from "./dto/tasks.dto.js";

@Injectable()
export class TasksRepository {
  constructor(private readonly db: Database) {}
  private table(tx: Transaction = this.db) {
    return tx.workTask;
  }
  private dto(row: WorkTask): RecordDto {
    return recordSchema.parse({
      id: row.id,
      module: "tasks",
      code: row.code,
      name: row.name,
      scope: row.scope,
      status: row.status,
      date: row.date.toISOString().slice(0, 10),
      assignee: row.assignee,
      reviewer: row.reviewer,
      note: row.note,
      fields: this.fields(row.fields),
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }
  /** Rows written before the comment and reviewer split may still carry legacy keys. */
  private fields(value: Prisma.JsonValue): RecordDto["fields"] {
    const raw = { ...(value as Record<string, unknown>) };
    delete raw.comments;
    delete raw.nguoiKiemTra;
    return raw as RecordDto["fields"];
  }
  async list(query: ListQuery) {
    const ids = query.ids
      ? query.ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];
    const where: Prisma.WorkTaskWhereInput = {
      ...(ids.length ? { id: { in: ids } } : {}),
      ...(query.scope !== undefined ? { scope: query.scope } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.assignee !== undefined ? { assignee: query.assignee } : {}),
      ...(query.reviewer !== undefined ? { reviewer: query.reviewer } : {}),
      ...(query.q
        ? {
            OR: [
              { code: { contains: query.q, mode: "insensitive" } },
              { name: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return this.db.$transaction(
      async (tx) => ({
        items: (
          await this.table(tx).findMany({
            where,
            orderBy: [{ date: "desc" }, { id: "asc" }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
          })
        ).map((row) => this.dto(row)),
        total: await this.table(tx).count({ where }),
        page: query.page,
        pageSize: query.pageSize,
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
  async get(id: string, tx: Transaction = this.db) {
    const row = await this.table(tx).findUnique({ where: { id } });
    if (!row)
      throw new NotFoundException("Không tìm thấy bản ghi trong phân hệ này.");
    return this.dto(row);
  }
  async create(input: RecordInput, tx: Transaction = this.db) {
    return this.dto(
      await this.table(tx).create({
        data: {
          ...input,
          status: INITIAL_TASK_STATUS,
          scope: input.scope || "",
          assignee: input.assignee || "",
          reviewer: input.reviewer || "",
          note: input.note || "",
          fields: input.fields || {},
          codeKey: input.code.normalize("NFKC").toLocaleLowerCase("vi"),
          date: new Date(input.date + "T00:00:00.000Z"),
        },
      }),
    );
  }
  async update(
    id: string,
    input: Partial<RecordInput> & { version: number },
    tx: Transaction = this.db,
  ) {
    const { version, date, ...patch } = input;
    const result = await this.table(tx).updateMany({
      where: { id, version },
      data: {
        ...patch,
        ...(patch.code
          ? { codeKey: patch.code.normalize("NFKC").toLocaleLowerCase("vi") }
          : {}),
        ...(date ? { date: new Date(date + "T00:00:00.000Z") } : {}),
        version: { increment: 1 },
      },
    });
    if (result.count !== 1) {
      await this.get(id, tx);
      throw new ConflictException(
        "Bản ghi đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.get(id, tx);
  }
  /** Status writes are reserved for the workflow composition; never exposed as a route body. */
  async applyStatus(
    id: string,
    status: TaskStatus,
    version: number,
    tx: Transaction = this.db,
  ) {
    return this.writeVersioned(id, { status }, version, tx);
  }
  async setDeadline(
    id: string,
    date: string,
    version: number,
    tx: Transaction = this.db,
  ) {
    return this.writeVersioned(
      id,
      { date: new Date(date + "T00:00:00.000Z") },
      version,
      tx,
    );
  }
  private async writeVersioned(
    id: string,
    data: Prisma.WorkTaskUpdateManyMutationInput,
    version: number,
    tx: Transaction,
  ) {
    const result = await this.table(tx).updateMany({
      where: { id, version },
      data: { ...data, version: { increment: 1 } },
    });
    if (result.count !== 1) {
      await this.get(id, tx);
      throw new ConflictException(
        "Công việc đã thay đổi. Vui lòng tải lại trước khi thao tác.",
      );
    }
    return this.get(id, tx);
  }
  async remove(id: string, version: number, tx: Transaction = this.db) {
    const result = await this.table(tx).deleteMany({ where: { id, version } });
    if (result.count !== 1) {
      await this.get(id, tx);
      throw new ConflictException("Bản ghi đã thay đổi. Vui lòng tải lại.");
    }
    return { id };
  }
}
