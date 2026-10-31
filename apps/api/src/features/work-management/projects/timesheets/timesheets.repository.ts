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
  type TimeEntry,
  type TimeEntryAdjustment,
  type TimesheetPeriod,
} from "@oneops/database";
import type { PeriodListQuery } from "./dto/timesheets.dto.js";

/** Row shapes owned by this repository; services depend on these, never on Prisma. */
export type TimesheetPeriodRow = TimesheetPeriod;
export type TimeEntryRow = TimeEntry;
export type TimeEntryAdjustmentRow = TimeEntryAdjustment;

const DAY = "T00:00:00.000Z";

@Injectable()
export class TimesheetsRepository {
  constructor(private readonly db: Database) {}

  private table(tx: Transaction = this.db) {
    return {
      periods: tx.timesheetPeriod,
      entries: tx.timeEntry,
      adjustments: tx.timeEntryAdjustment,
    };
  }

  async list(query: PeriodListQuery) {
    const where: Prisma.TimesheetPeriodWhereInput = {
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from ? { weekStart: { gte: new Date(query.from + DAY) } } : {}),
      ...(query.to ? { weekEnd: { lte: new Date(query.to + DAY) } } : {}),
    };
    return this.db.$transaction(
      async (tx) => ({
        items: await this.table(tx).periods.findMany({
          where,
          orderBy: [{ weekStart: "desc" }, { employeeName: "asc" }],
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        }),
        total: await this.table(tx).periods.count({ where }),
        page: query.page,
        pageSize: query.pageSize,
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  findByWeek(employeeId: string, weekStart: string, tx: Transaction = this.db) {
    return this.table(tx).periods.findUnique({
      where: {
        employeeId_weekStart: {
          employeeId,
          weekStart: new Date(weekStart + DAY),
        },
      },
    });
  }

  createPeriod(
    input: {
      employeeId: string;
      employeeName: string;
      weekStart: string;
      weekEnd: string;
    },
    tx: Transaction = this.db,
  ) {
    return this.table(tx).periods.create({
      data: {
        employeeId: input.employeeId,
        employeeName: input.employeeName,
        weekStart: new Date(input.weekStart + DAY),
        weekEnd: new Date(input.weekEnd + DAY),
        status: "OPEN",
      },
    });
  }

  async get(id: string, tx: Transaction = this.db): Promise<TimesheetPeriod> {
    const row = await this.table(tx).periods.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy kỳ timesheet này.");
    return row;
  }

  entries(periodId: string, tx: Transaction = this.db) {
    return this.table(tx).entries.findMany({
      where: { periodId },
      orderBy: [{ workDate: "asc" }, { createdAt: "asc" }],
    });
  }

  async getEntry(id: string, tx: Transaction = this.db): Promise<TimeEntry> {
    const row = await this.table(tx).entries.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy dòng thời gian này.");
    return row;
  }

  entryByKey(requestKey: string, tx: Transaction = this.db) {
    return this.table(tx).entries.findUnique({ where: { requestKey } });
  }

  createEntry(
    input: {
      periodId: string;
      employeeId: string;
      workDate: string;
      minutes: number;
      projectId: string | null;
      taskId: string | null;
      note: string;
      billable: boolean;
      requestKey: string | null;
    },
    tx: Transaction = this.db,
  ) {
    return this.table(tx).entries.create({
      data: { ...input, workDate: new Date(input.workDate + DAY) },
    });
  }

  async updateEntry(
    id: string,
    patch: {
      version: number;
      workDate?: string;
      minutes?: number;
      projectId?: string | null;
      taskId?: string | null;
      note?: string;
      billable?: boolean;
    },
    tx: Transaction = this.db,
  ) {
    const { version, workDate, ...rest } = patch;
    const result = await this.table(tx).entries.updateMany({
      where: { id, version },
      data: {
        ...rest,
        ...(workDate ? { workDate: new Date(workDate + DAY) } : {}),
        version: { increment: 1 },
      },
    });
    if (result.count !== 1) {
      await this.getEntry(id, tx);
      throw new ConflictException(
        "Dòng thời gian đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.getEntry(id, tx);
  }

  async removeEntry(id: string, version: number, tx: Transaction = this.db) {
    const result = await this.table(tx).entries.deleteMany({
      where: { id, version },
    });
    if (result.count !== 1) {
      await this.getEntry(id, tx);
      throw new ConflictException(
        "Dòng thời gian đã thay đổi. Vui lòng tải lại.",
      );
    }
    return { id };
  }

  adjustments(periodId: string, tx: Transaction = this.db) {
    return this.table(tx).adjustments.findMany({
      where: { periodId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
  }

  createAdjustment(
    input: {
      entryId: string;
      periodId: string;
      deltaMinutes: number;
      note: string;
      adjustedById: string;
      adjustedByName: string;
    },
    tx: Transaction = this.db,
  ) {
    return this.table(tx).adjustments.create({ data: input });
  }

  /** Total minutes of a period, including append-only adjustments. */
  async total(periodId: string, tx: Transaction = this.db) {
    const [entries, adjustments] = await Promise.all([
      this.table(tx).entries.findMany({
        where: { periodId },
        select: { minutes: true },
      }),
      this.table(tx).adjustments.findMany({
        where: { periodId },
        select: { deltaMinutes: true },
      }),
    ]);
    return (
      entries.reduce((sum, entry) => sum + entry.minutes, 0) +
      adjustments.reduce((sum, row) => sum + row.deltaMinutes, 0)
    );
  }

  async updatePeriod(
    id: string,
    data: {
      version: number;
      status?: string;
      totalMinutes?: number;
      overThreshold?: boolean;
      submittedAt?: Date | null;
      decidedAt?: Date | null;
      decidedByName?: string;
      decisionNote?: string;
    },
    tx: Transaction = this.db,
  ) {
    const { version, ...rest } = data;
    const result = await this.table(tx).periods.updateMany({
      where: { id, version },
      data: { ...rest, version: { increment: 1 } },
    });
    if (result.count !== 1) {
      await this.get(id, tx);
      throw new ConflictException(
        "Kỳ timesheet đã thay đổi. Vui lòng tải lại trước khi thao tác.",
      );
    }
    return this.get(id, tx);
  }

  transaction<T>(run: (tx: Transaction) => Promise<T>) {
    return this.db.$transaction(run, {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    });
  }
}
