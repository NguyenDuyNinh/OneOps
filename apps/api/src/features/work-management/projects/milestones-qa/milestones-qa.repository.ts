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
  type AcceptanceItem,
  type AcceptanceResult,
  type Milestone,
} from "@oneops/database";
import type {
  AcceptancePatch,
  MilestoneListQuery,
} from "./dto/milestones-qa.dto.js";

/** Row shapes owned by this repository; services depend on these, never on Prisma. */
export type MilestoneRow = Milestone;
export type AcceptanceItemRow = AcceptanceItem;
export type AcceptanceResultRow = AcceptanceResult;

const DAY = "T00:00:00.000Z";

@Injectable()
export class MilestonesQaRepository {
  constructor(private readonly db: Database) {}

  private table(tx: Transaction = this.db) {
    return {
      milestones: tx.milestone,
      links: tx.milestoneItem,
      items: tx.acceptanceItem,
      results: tx.acceptanceResult,
    };
  }

  async list(query: MilestoneListQuery) {
    const where: Prisma.MilestoneWhereInput = {
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.q ? { name: { contains: query.q, mode: "insensitive" } } : {}),
    };
    return this.db.$transaction(
      async (tx) => {
        const rows = await this.table(tx).milestones.findMany({
          where,
          orderBy: [{ targetDate: "asc" }, { id: "asc" }],
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        });
        const links = rows.length
          ? await this.table(tx).links.findMany({
              where: { milestoneId: { in: rows.map((row) => row.id) } },
              orderBy: { createdAt: "asc" },
            })
          : [];
        return {
          rows,
          links,
          total: await this.table(tx).milestones.count({ where }),
          page: query.page,
          pageSize: query.pageSize,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async get(id: string, tx: Transaction = this.db): Promise<Milestone> {
    const row = await this.table(tx).milestones.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy mốc dự án này.");
    return row;
  }

  async create(
    input: {
      projectId: string;
      name: string;
      description: string;
      targetDate: string;
      contractRef: string;
      status: string;
    },
    tx: Transaction = this.db,
  ) {
    return this.table(tx).milestones.create({
      data: { ...input, targetDate: new Date(input.targetDate + DAY) },
    });
  }

  async update(
    id: string,
    patch: {
      version: number;
      name?: string;
      description?: string;
      targetDate?: string;
      contractRef?: string;
      status?: string;
    },
    tx: Transaction = this.db,
  ) {
    const { version, targetDate, ...rest } = patch;
    const result = await this.table(tx).milestones.updateMany({
      where: { id, version },
      data: {
        ...rest,
        ...(targetDate ? { targetDate: new Date(targetDate + DAY) } : {}),
        version: { increment: 1 },
      },
    });
    if (result.count !== 1) {
      await this.get(id, tx);
      throw new ConflictException(
        "Mốc dự án đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.get(id, tx);
  }

  linksOf(milestoneId: string, tx: Transaction = this.db) {
    return this.table(tx).links.findMany({
      where: { milestoneId },
      orderBy: { createdAt: "asc" },
    });
  }

  async addLinks(
    milestoneId: string,
    taskIds: readonly string[],
    tx: Transaction = this.db,
  ) {
    await this.table(tx).links.createMany({
      data: taskIds.map((taskId) => ({ milestoneId, taskId })),
      skipDuplicates: true,
    });
    return this.linksOf(milestoneId, tx);
  }

  async removeLink(
    milestoneId: string,
    taskId: string,
    tx: Transaction = this.db,
  ) {
    const result = await this.table(tx).links.deleteMany({
      where: { milestoneId, taskId },
    });
    if (result.count !== 1)
      throw new NotFoundException("Công việc không thuộc mốc dự án này.");
    return { taskId };
  }

  async listAcceptance(taskId: string) {
    return this.db.$transaction(
      async (tx) => {
        const items = await this.table(tx).items.findMany({
          where: { taskId },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        });
        const ids = items.map((item) => item.id);
        const [results, counts] = ids.length
          ? await Promise.all([
              this.table(tx).results.findMany({
                where: { itemId: { in: ids } },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
              }),
              this.table(tx).results.groupBy({
                by: ["itemId"],
                where: { itemId: { in: ids } },
                _count: { _all: true },
              }),
            ])
          : [[], []];
        return { items, results, counts };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async getItem(
    id: string,
    tx: Transaction = this.db,
  ): Promise<AcceptanceItem> {
    const row = await this.table(tx).items.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy tiêu chí kiểm tra.");
    return row;
  }

  createItem(
    input: {
      taskId: string;
      title: string;
      steps: string;
      expected: string;
      mandatory: boolean;
    },
    tx: Transaction = this.db,
  ) {
    return this.table(tx).items.create({ data: input });
  }

  async updateItem(
    id: string,
    patch: AcceptancePatch,
    tx: Transaction = this.db,
  ) {
    const { version, ...rest } = patch;
    const result = await this.table(tx).items.updateMany({
      where: { id, version },
      data: { ...rest, version: { increment: 1 } },
    });
    if (result.count !== 1) {
      await this.getItem(id, tx);
      throw new ConflictException(
        "Tiêu chí kiểm tra đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.getItem(id, tx);
  }

  async removeItem(id: string, version: number, tx: Transaction = this.db) {
    const result = await this.table(tx).items.deleteMany({
      where: { id, version },
    });
    if (result.count !== 1) {
      await this.getItem(id, tx);
      throw new ConflictException(
        "Tiêu chí kiểm tra đã thay đổi. Vui lòng tải lại.",
      );
    }
    return { id };
  }

  recordResult(
    input: {
      itemId: string;
      outcome: string;
      note: string;
      evidence: Prisma.InputJsonValue;
      testedByAccountId: string | null;
      testedByName: string;
      isOverride: boolean;
    },
    tx: Transaction = this.db,
  ) {
    return this.table(tx).results.create({ data: input });
  }

  resultsOf(itemId: string, tx: Transaction = this.db) {
    return this.table(tx).results.findMany({
      where: { itemId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  /** Mandatory criteria plus their newest result, used by the completion gate. */
  async gateItems(taskId: string) {
    const items = await this.table().items.findMany({
      where: { taskId, mandatory: true },
      orderBy: { createdAt: "asc" },
    });
    if (!items.length)
      return { items, latest: new Map<string, AcceptanceResult>() };
    const results = await this.table().results.findMany({
      where: { itemId: { in: items.map((item) => item.id) } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
    const latest = new Map<string, AcceptanceResult>();
    for (const result of results)
      if (!latest.has(result.itemId)) latest.set(result.itemId, result);
    return { items, latest };
  }
}
