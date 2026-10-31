import { Injectable } from "@nestjs/common";
import { Database } from "../../../../core/database/database.module.js";
import { Prisma, type WorkTaskComment } from "@oneops/database";
import { commentSchema } from "./dto/task-comments.dto.js";
import type { CommentDto, CommentListQuery } from "./dto/task-comments.dto.js";

@Injectable()
export class TaskCommentsRepository {
  constructor(private readonly db: Database) {}

  private table() {
    return this.db.workTaskComment;
  }

  private dto(row: WorkTaskComment): CommentDto {
    return commentSchema.parse({
      id: row.id,
      taskId: row.taskId,
      author: row.author,
      body: row.body,
      mentions: row.mentions as string[],
      attachments: row.attachments as CommentDto["attachments"],
      kind: row.kind,
      createdAt: row.createdAt.toISOString(),
    });
  }

  async create(input: {
    taskId: string;
    authorAccountId: string | null;
    author: string;
    body: string;
    mentions: string[];
    attachments: CommentDto["attachments"];
    kind: string;
  }) {
    return this.dto(await this.table().create({ data: input }));
  }

  async list(query: CommentListQuery) {
    const where: Prisma.WorkTaskCommentWhereInput = { taskId: query.taskId };
    return this.db.$transaction(
      async (tx) => ({
        items: (
          await tx.workTaskComment.findMany({
            where,
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
          })
        ).map((row) => this.dto(row)),
        total: await tx.workTaskComment.count({ where }),
        page: query.page,
        pageSize: query.pageSize,
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async counts(taskIds: readonly string[]) {
    if (!taskIds.length) return [];
    const rows = await this.table().groupBy({
      by: ["taskId"],
      where: { taskId: { in: [...taskIds] } },
      _count: { _all: true },
    });
    return rows.map((row) => ({ taskId: row.taskId, count: row._count._all }));
  }
}
