import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, type AuditEntry as AuditEntryRow } from "@oneops/database";
import {
  Database,
  type Transaction,
} from "../../../core/database/database.module.js";
import {
  auditEntrySchema,
  facetsSchema,
  pageSchema,
  type AuditEntryDto,
  type AuditFacets,
  type AuditPage,
  type AuditResult,
  type ListQuery,
} from "./dto/checklog.dto.js";

/** Row handed to the sink after redaction; actor fields are filled by the caller. */
export interface AuditRow {
  featureKey: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  reason: string;
  before?: unknown;
  after?: unknown;
  actorAccountId: string | null;
  actorName: string;
  actorRole: string;
  isSystemAdmin: boolean;
  isOutOfScopeOverride: boolean;
  result: AuditResult;
}

const DAY = 86_400_000;

/**
 * Normalises a redacted value to plain JSON so Prisma stores exactly what the
 * audit page will render (no class instances, dates or undefined).
 */
function jsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  const text = JSON.stringify(value);
  if (text === undefined) return undefined;
  return JSON.parse(text) as Prisma.InputJsonValue;
}

@Injectable()
export class ChecklogRepository {
  constructor(private readonly db: Database) {}

  private entries(tx: Transaction = this.db) {
    return tx.auditEntry;
  }

  /** Append-only: there is no update or delete path for an audit entry. */
  async insert(rows: readonly AuditRow[], tx?: Transaction) {
    if (!rows.length) return;
    await this.entries(tx).createMany({
      data: rows.map((row) => ({
        featureKey: row.featureKey,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        summary: row.summary,
        reason: row.reason,
        beforeValue: jsonValue(row.before) ?? Prisma.DbNull,
        afterValue: jsonValue(row.after) ?? Prisma.DbNull,
        actorAccountId: row.actorAccountId,
        actorName: row.actorName,
        actorRole: row.actorRole,
        isSystemAdmin: row.isSystemAdmin,
        isOutOfScopeOverride: row.isOutOfScopeOverride,
        result: row.result,
      })),
    });
  }

  async list(query: ListQuery): Promise<AuditPage> {
    const createdAt = {
      ...(query.from ? { gte: new Date(`${query.from}T00:00:00.000Z`) } : {}),
      ...(query.to
        ? {
            lt: new Date(new Date(`${query.to}T00:00:00.000Z`).getTime() + DAY),
          }
        : {}),
    };
    const where: Prisma.AuditEntryWhereInput = {
      ...(query.feature ? { featureKey: query.feature } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.result ? { result: query.result } : {}),
      ...(query.override === undefined
        ? {}
        : { isOutOfScopeOverride: query.override }),
      ...(query.actor
        ? { actorName: { contains: query.actor, mode: "insensitive" } }
        : {}),
      ...(query.q
        ? {
            OR: [
              { summary: { contains: query.q, mode: "insensitive" } },
              { reason: { contains: query.q, mode: "insensitive" } },
              { targetId: { contains: query.q, mode: "insensitive" } },
              { actorName: { contains: query.q, mode: "insensitive" } },
              { featureKey: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
    };
    return this.db.$transaction(
      async (tx) =>
        pageSchema.parse({
          items: (
            await this.entries(tx).findMany({
              where,
              orderBy: [{ createdAt: "desc" }, { id: "desc" }],
              skip: (query.page - 1) * query.pageSize,
              take: query.pageSize,
            })
          ).map((row) => this.dto(row)),
          total: await this.entries(tx).count({ where }),
          page: query.page,
          pageSize: query.pageSize,
        }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async get(id: string): Promise<AuditEntryDto> {
    const row = await this.entries().findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy bản ghi nhật ký.");
    return this.dto(row);
  }

  async facets(): Promise<AuditFacets> {
    const [features, actions] = await Promise.all([
      this.entries().groupBy({
        by: ["featureKey"],
        _count: { _all: true },
        orderBy: { featureKey: "asc" },
      }),
      this.entries().groupBy({
        by: ["action"],
        _count: { _all: true },
        orderBy: { action: "asc" },
      }),
    ]);
    return facetsSchema.parse({
      features: features.map((row) => ({
        key: row.featureKey,
        count: row._count._all,
      })),
      actions: actions.map((row) => ({
        key: row.action,
        count: row._count._all,
      })),
    });
  }

  private dto(row: AuditEntryRow): AuditEntryDto {
    return auditEntrySchema.parse({
      id: row.id,
      featureKey: row.featureKey,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      summary: row.summary,
      reason: row.reason,
      before: row.beforeValue === null ? null : row.beforeValue,
      after: row.afterValue === null ? null : row.afterValue,
      actorAccountId: row.actorAccountId,
      actorName: row.actorName,
      actorRole: row.actorRole,
      isSystemAdmin: row.isSystemAdmin,
      isOutOfScopeOverride: row.isOutOfScopeOverride,
      result: row.result as AuditResult,
      createdAt: row.createdAt.toISOString(),
    });
  }
}
