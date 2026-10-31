import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Database,
  type Transaction,
} from "../../../../core/database/database.module.js";
import {
  Prisma,
  type WorkTaskProposal,
  type WorkTaskTransition,
} from "@oneops/database";
import { proposalSchema, transitionSchema } from "./dto/task-workflow.dto.js";
import type {
  ProposalDto,
  ProposalQuery,
  TransitionDto,
} from "./dto/task-workflow.dto.js";

@Injectable()
export class TaskWorkflowRepository {
  constructor(private readonly db: Database) {}

  private transitions(tx: Transaction = this.db) {
    return tx.workTaskTransition;
  }

  private proposals(tx: Transaction = this.db) {
    return tx.workTaskProposal;
  }

  private transitionDto(row: WorkTaskTransition): TransitionDto {
    return transitionSchema.parse({
      id: row.id,
      taskId: row.taskId,
      code: row.code,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      reason: row.reason,
      actorName: row.actorName,
      actorRole: row.actorRole,
      taskVersion: row.taskVersion,
      occurredAt: row.occurredAt.toISOString(),
    });
  }

  private proposalDto(row: WorkTaskProposal): ProposalDto {
    return proposalSchema.parse({
      id: row.id,
      taskId: row.taskId,
      kind: row.kind,
      status: row.status,
      reason: row.reason,
      payload: row.payload as Record<string, unknown>,
      requestedByName: row.requestedByName,
      decidedByName: row.decidedByName,
      decisionReason: row.decisionReason,
      decidedAt: row.decidedAt?.toISOString() ?? null,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }

  transaction<T>(run: (tx: Transaction) => Promise<T>) {
    return this.db.$transaction(run, {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    });
  }

  /**
   * Serializes proposal creation per task so two employees cannot open two
   * pending proposals at the same time (BR-ST-04).
   */
  async lockTask(taskId: string, tx: Transaction) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${taskId}))`;
  }

  async recordTransition(
    input: {
      taskId: string;
      fromStatus: string;
      toStatus: string;
      code: string;
      reason: string;
      actorAccountId: string | null;
      actorName: string;
      actorRole: string;
      taskVersion: number;
      requestKey: string | null;
    },
    tx: Transaction = this.db,
  ) {
    return this.transitionDto(
      await this.transitions(tx).create({ data: input }),
    );
  }

  async history(taskId: string, tx: Transaction = this.db) {
    return (
      await this.transitions(tx).findMany({
        where: { taskId },
        orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
      })
    ).map((row) => this.transitionDto(row));
  }

  async transitionByKey(
    taskId: string,
    requestKey: string,
    tx: Transaction = this.db,
  ) {
    const row = await this.transitions(tx).findFirst({
      where: { taskId, requestKey },
    });
    return row ? this.transitionDto(row) : null;
  }

  async latestHold(taskId: string, tx: Transaction = this.db) {
    const row = await this.transitions(tx).findFirst({
      where: { taskId, toStatus: "Hoãn lại" },
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    });
    return row ? this.transitionDto(row) : null;
  }

  /** Latest hold origin per task, used to render TR-07 without loading full history. */
  async latestHolds(taskIds: readonly string[], tx: Transaction = this.db) {
    const map = new Map<string, string>();
    if (!taskIds.length) return map;
    const rows = await this.transitions(tx).findMany({
      where: { taskId: { in: [...taskIds] }, toStatus: "Hoãn lại" },
      orderBy: [{ occurredAt: "desc" }, { id: "desc" }],
    });
    for (const row of rows)
      if (!map.has(row.taskId)) map.set(row.taskId, row.fromStatus);
    return map;
  }

  async pendingProposal(taskId: string, tx: Transaction = this.db) {
    const row = await this.proposals(tx).findFirst({
      where: { taskId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    return row ? this.proposalDto(row) : null;
  }

  async pendingProposals(
    taskIds: readonly string[],
    tx: Transaction = this.db,
  ) {
    if (!taskIds.length) return [];
    return (
      await this.proposals(tx).findMany({
        where: { taskId: { in: [...taskIds] }, status: "PENDING" },
      })
    ).map((row) => this.proposalDto(row));
  }

  async createProposal(
    input: {
      taskId: string;
      kind: string;
      status: string;
      reason: string;
      payload: Prisma.InputJsonValue;
      requestedByAccountId: string | null;
      requestedByName: string;
      requestKey: string | null;
    },
    tx: Transaction = this.db,
  ) {
    return this.proposalDto(await this.proposals(tx).create({ data: input }));
  }

  async proposalByKey(
    taskId: string,
    requestKey: string,
    tx: Transaction = this.db,
  ) {
    const row = await this.proposals(tx).findFirst({
      where: { taskId, requestKey },
    });
    return row ? this.proposalDto(row) : null;
  }

  async listProposals(query: ProposalQuery) {
    const where: Prisma.WorkTaskProposalWhereInput = {
      ...(query.taskId ? { taskId: query.taskId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.kind ? { kind: query.kind } : {}),
    };
    return this.db.$transaction(
      async (tx) => ({
        items: (
          await this.proposals(tx).findMany({
            where,
            orderBy: [{ createdAt: "desc" }, { id: "asc" }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
          })
        ).map((row) => this.proposalDto(row)),
        total: await this.proposals(tx).count({ where }),
        page: query.page,
        pageSize: query.pageSize,
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async getProposal(id: string, tx: Transaction = this.db) {
    const row = await this.proposals(tx).findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy đề xuất.");
    return this.proposalDto(row);
  }

  async decideProposal(
    id: string,
    input: {
      version: number;
      status: string;
      decidedByAccountId: string | null;
      decidedByName: string;
      decisionReason: string;
    },
    tx: Transaction = this.db,
  ) {
    const { version, ...patch } = input;
    const result = await this.proposals(tx).updateMany({
      where: { id, version, status: "PENDING" },
      data: { ...patch, decidedAt: new Date(), version: { increment: 1 } },
    });
    if (result.count !== 1) {
      await this.getProposal(id, tx);
      throw new ConflictException(
        "Đề xuất đã được xử lý. Vui lòng tải lại trước khi quyết định.",
      );
    }
    return this.getProposal(id, tx);
  }

  /** BR-ST-15: any status change closes the pending proposal of that task. */
  async closePending(
    taskId: string,
    actorName: string,
    reason: string,
    tx: Transaction = this.db,
    skipId?: string,
  ) {
    const rows = await this.proposals(tx).findMany({
      where: {
        taskId,
        status: "PENDING",
        ...(skipId ? { id: { not: skipId } } : {}),
      },
    });
    if (!rows.length) return [];
    await this.proposals(tx).updateMany({
      where: {
        taskId,
        status: "PENDING",
        ...(skipId ? { id: { not: skipId } } : {}),
      },
      data: {
        status: "AUTO_CLOSED",
        decidedByName: actorName,
        decisionReason: reason,
        decidedAt: new Date(),
        version: { increment: 1 },
      },
    });
    return rows.map((row) =>
      this.proposalDto({
        ...row,
        status: "AUTO_CLOSED",
        decidedByName: actorName,
        decisionReason: reason,
        decidedAt: new Date(),
        version: row.version + 1,
      }),
    );
  }
}
