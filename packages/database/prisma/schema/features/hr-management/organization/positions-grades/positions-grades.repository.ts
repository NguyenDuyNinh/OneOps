import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {
  Database,
  type Transaction,
} from "../../../../core/database/database.module.js";
import { Prisma, type Grade, type Position } from "@oneops/database";
import { gradeSchema, positionSchema } from "./dto/positions-grades.dto.js";
import type {
  GradeDto,
  GradeInput,
  ListQuery,
  PositionDto,
  PositionInput,
} from "./dto/positions-grades.dto.js";
@Injectable()
export class PositionsGradesRepository {
  constructor(private readonly db: Database) {}
  private positions(tx: Transaction = this.db) {
    return tx.position;
  }
  private grades(tx: Transaction = this.db) {
    return tx.grade;
  }
  private positionDto(
    row: Position & { _count: { grades: number } },
  ): PositionDto {
    return positionSchema.parse({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      status: row.status,
      gradeCount: row._count.grades,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }
  private gradeDto(row: Grade): GradeDto {
    return gradeSchema.parse({
      id: row.id,
      code: row.code,
      name: row.name,
      rank: row.rank,
      description: row.description,
      status: row.status,
      positionId: row.positionId,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }
  async listPositions(query: ListQuery) {
    const where: Prisma.PositionWhereInput = {
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
      async (tx) => ({
        items: (
          await this.positions(tx).findMany({
            where,
            include: { _count: { select: { grades: true } } },
            orderBy: [{ status: "asc" }, { name: "asc" }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
          })
        ).map((row) => this.positionDto(row)),
        total: await this.positions(tx).count({ where }),
        page: query.page,
        pageSize: query.pageSize,
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
  async getPosition(id: string, tx: Transaction = this.db) {
    const row = await this.positions(tx).findUnique({
      where: { id },
      include: { _count: { select: { grades: true } } },
    });
    if (!row) throw new NotFoundException("Không tìm thấy chức danh.");
    return this.positionDto(row);
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
  async createPosition(input: PositionInput, tx: Transaction = this.db) {
    return this.positionDto(
      await this.unique(() =>
        this.positions(tx).create({
          data: {
            ...input,
            codeKey: input.code.normalize("NFKC").toLowerCase(),
          },
          include: { _count: { select: { grades: true } } },
        }),
      ),
    );
  }
  async updatePosition(
    id: string,
    input: Partial<PositionInput> & { version: number },
    tx: Transaction = this.db,
  ) {
    const { version, code, ...patch } = input;
    const result = await this.unique(() =>
      this.positions(tx).updateMany({
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
      await this.getPosition(id, tx);
      throw new ConflictException(
        "Chức danh đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.getPosition(id, tx);
  }
  async listGrades(query: ListQuery) {
    const where: Prisma.GradeWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.positionId ? { positionId: query.positionId } : {}),
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
          await this.grades(tx).findMany({
            where,
            orderBy: [{ rank: "asc" }, { name: "asc" }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
          })
        ).map((row) => this.gradeDto(row)),
        total: await this.grades(tx).count({ where }),
        page: query.page,
        pageSize: query.pageSize,
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
  async getGrade(id: string, tx: Transaction = this.db) {
    const row = await this.grades(tx).findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy cấp bậc.");
    return this.gradeDto(row);
  }
  async createGrade(input: GradeInput, tx: Transaction = this.db) {
    if (input.positionId) await this.getPosition(input.positionId, tx);
    const { positionId, ...rest } = input;
    return this.gradeDto(
      await this.unique(() =>
        this.grades(tx).create({
          data: {
            ...rest,
            ...(positionId ? { positionId } : {}),
            codeKey: input.code.normalize("NFKC").toLowerCase(),
          },
        }),
      ),
    );
  }
  async updateGrade(
    id: string,
    input: Partial<GradeInput> & { version: number },
    tx: Transaction = this.db,
  ) {
    const { version, code, positionId, ...patch } = input;
    if (positionId) await this.getPosition(positionId, tx);
    const result = await this.unique(() =>
      this.grades(tx).updateMany({
        where: { id, version },
        data: {
          ...patch,
          ...(positionId !== undefined ? { positionId } : {}),
          ...(code
            ? { code, codeKey: code.normalize("NFKC").toLowerCase() }
            : {}),
          version: { increment: 1 },
        },
      }),
    );
    if (result.count !== 1) {
      await this.getGrade(id, tx);
      throw new ConflictException(
        "Cấp bậc đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.getGrade(id, tx);
  }
}
