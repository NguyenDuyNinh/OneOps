import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {
  Database,
  type Transaction,
} from "../../../../core/database/database.module.js";
import { Prisma, type Department, type Team } from "@oneops/database";
import { departmentSchema, teamSchema } from "./dto/departments-teams.dto.js";
import type {
  DepartmentDto,
  DepartmentInput,
  ListQuery,
  TeamDto,
  TeamInput,
} from "./dto/departments-teams.dto.js";
@Injectable()
export class DepartmentsTeamsRepository {
  constructor(private readonly db: Database) {}
  private departments(tx: Transaction = this.db) {
    return tx.department;
  }
  private teams(tx: Transaction = this.db) {
    return tx.team;
  }
  private departmentDto(
    row: Department,
    counts: { total: number; active: number },
  ): DepartmentDto {
    return departmentSchema.parse({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      managerName: row.managerName,
      status: row.status,
      teamCount: counts.total,
      activeTeamCount: counts.active,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }
  private async teamCounts(ids: string[], tx: Transaction) {
    const counts = new Map<string, { total: number; active: number }>();
    if (!ids.length) return counts;
    const rows = await this.teams(tx).groupBy({
      by: ["departmentId", "status"],
      where: { departmentId: { in: ids } },
      _count: { _all: true },
    });
    for (const row of rows) {
      const current = counts.get(row.departmentId) ?? { total: 0, active: 0 };
      current.total += row._count._all;
      if (row.status === "ACTIVE") current.active += row._count._all;
      counts.set(row.departmentId, current);
    }
    return counts;
  }
  private teamDto(row: Team): TeamDto {
    return teamSchema.parse({
      id: row.id,
      departmentId: row.departmentId,
      code: row.code,
      name: row.name,
      description: row.description,
      managerName: row.managerName,
      status: row.status,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }
  async listDepartments(query: ListQuery) {
    const where: Prisma.DepartmentWhereInput = {
      ...(query.status ? { status: query.status } : {}),
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
      async (tx) => {
        const rows = await this.departments(tx).findMany({
          where,
          orderBy: [{ status: "asc" }, { name: "asc" }],
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        });
        const counts = await this.teamCounts(
          rows.map((row) => row.id),
          tx,
        );
        return {
          items: rows.map((row) =>
            this.departmentDto(
              row,
              counts.get(row.id) ?? { total: 0, active: 0 },
            ),
          ),
          total: await this.departments(tx).count({ where }),
          page: query.page,
          pageSize: query.pageSize,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
  async getDepartment(id: string, tx: Transaction = this.db) {
    const row = await this.departments(tx).findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy phòng ban.");
    const counts = await this.teamCounts([id], tx);
    return this.departmentDto(row, counts.get(id) ?? { total: 0, active: 0 });
  }
  private async unique<T>(operation: () => Promise<T>) {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ConflictException("Mã đã tồn tại. Vui lòng chọn mã khác.");
      throw error;
    }
  }
  async createDepartment(input: DepartmentInput, tx: Transaction = this.db) {
    return this.departmentDto(
      await this.unique(() =>
        this.departments(tx).create({
          data: {
            ...input,
            codeKey: input.code.normalize("NFKC").toLowerCase(),
          },
        }),
      ),
      { total: 0, active: 0 },
    );
  }
  async updateDepartment(
    id: string,
    input: Partial<DepartmentInput> & { version: number },
    tx: Transaction = this.db,
  ) {
    const { version, code, ...patch } = input;
    const result = await this.unique(() =>
      this.departments(tx).updateMany({
        where: { id, version },
        data: {
          ...patch,
          ...(code
            ? { code, codeKey: code.normalize("NFKC").toLowerCase() }
            : {}),
          version: { increment: 1 },
        },
      }),
    );
    if (result.count !== 1) {
      await this.getDepartment(id, tx);
      throw new ConflictException(
        "Phòng ban đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.getDepartment(id, tx);
  }
  async listTeams(query: ListQuery) {
    const where: Prisma.TeamWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
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
          await this.teams(tx).findMany({
            where,
            orderBy: [{ status: "asc" }, { name: "asc" }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
          })
        ).map((row) => this.teamDto(row)),
        total: await this.teams(tx).count({ where }),
        page: query.page,
        pageSize: query.pageSize,
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
  async getTeam(id: string, tx: Transaction = this.db) {
    const row = await this.teams(tx).findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy nhóm.");
    return this.teamDto(row);
  }
  async createTeam(input: TeamInput, tx: Transaction = this.db) {
    await this.getDepartment(input.departmentId, tx);
    return this.teamDto(
      await this.unique(() =>
        this.teams(tx).create({
          data: {
            ...input,
            codeKey: input.code.normalize("NFKC").toLowerCase(),
          },
        }),
      ),
    );
  }
  async updateTeam(
    id: string,
    input: Partial<Omit<TeamInput, "departmentId">> & { version: number },
    tx: Transaction = this.db,
  ) {
    const { version, code, ...patch } = input;
    const result = await this.unique(() =>
      this.teams(tx).updateMany({
        where: { id, version },
        data: {
          ...patch,
          ...(code
            ? { code, codeKey: code.normalize("NFKC").toLowerCase() }
            : {}),
          version: { increment: 1 },
        },
      }),
    );
    if (result.count !== 1) {
      await this.getTeam(id, tx);
      throw new ConflictException(
        "Nhóm đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.getTeam(id, tx);
  }
  async activeTeamCount(departmentId: string, tx: Transaction = this.db) {
    return this.teams(tx).count({
      where: { departmentId, status: "ACTIVE" },
    });
  }
}
