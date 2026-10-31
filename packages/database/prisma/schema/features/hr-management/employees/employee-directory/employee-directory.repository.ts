import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {
  Database,
  type Transaction,
} from "../../../../core/database/database.module.js";
import { Prisma, type Employee } from "@oneops/database";
import { employeeSchema } from "./dto/employee-directory.dto.js";
import type {
  EmployeeDto,
  EmployeeInput,
  ListQuery,
} from "./dto/employee-directory.dto.js";
const codeKeyOf = (code: string) => code.normalize("NFKC").toLowerCase();
const emailKeyOf = (email: string) =>
  email ? email.normalize("NFKC").toLowerCase() : null;
const dateOf = (value: string | null | undefined) =>
  value ? new Date(`${value}T00:00:00.000Z`) : null;
@Injectable()
export class EmployeeDirectoryRepository {
  constructor(private readonly db: Database) {}
  private employees(tx: Transaction = this.db) {
    return tx.employee;
  }
  private dto(row: Employee): EmployeeDto {
    return employeeSchema.parse({
      id: row.id,
      code: row.code,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      jobTitle: row.jobTitle,
      departmentName: row.departmentName,
      teamName: row.teamName,
      managerName: row.managerName,
      startDate: row.startDate
        ? row.startDate.toISOString().slice(0, 10)
        : null,
      status: row.status,
      note: row.note,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }
  private async unique<T>(operation: () => Promise<T>) {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = String(error.meta?.target ?? "");
        throw new ConflictException(
          target.includes("email_key")
            ? "Email đã được dùng cho nhân viên khác."
            : "Mã nhân viên đã tồn tại. Vui lòng chọn mã khác.",
        );
      }
      throw error;
    }
  }
  async list(query: ListQuery) {
    const where: Prisma.EmployeeWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.departmentName ? { departmentName: query.departmentName } : {}),
      ...(query.jobTitle ? { jobTitle: query.jobTitle } : {}),
      ...(query.q
        ? {
            OR: [
              { code: { contains: query.q, mode: "insensitive" } },
              { fullName: { contains: query.q, mode: "insensitive" } },
              { email: { contains: query.q, mode: "insensitive" } },
              { jobTitle: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return this.db.$transaction(
      async (tx) => ({
        items: (
          await this.employees(tx).findMany({
            where,
            orderBy: [{ status: "asc" }, { fullName: "asc" }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
          })
        ).map((row) => this.dto(row)),
        total: await this.employees(tx).count({ where }),
        page: query.page,
        pageSize: query.pageSize,
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
  async get(id: string, tx: Transaction = this.db) {
    const row = await this.employees(tx).findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy nhân viên.");
    return this.dto(row);
  }
  async create(input: EmployeeInput, tx: Transaction = this.db) {
    return this.dto(
      await this.unique(() =>
        this.employees(tx).create({
          data: {
            ...input,
            codeKey: codeKeyOf(input.code),
            emailKey: emailKeyOf(input.email ?? ""),
            startDate: dateOf(input.startDate),
          },
        }),
      ),
    );
  }
  async update(
    id: string,
    input: Partial<EmployeeInput> & { version: number },
    tx: Transaction = this.db,
  ) {
    const { version, code, email, startDate, ...patch } = input;
    const result = await this.unique(() =>
      this.employees(tx).updateMany({
        where: { id, version },
        data: {
          ...patch,
          ...(code ? { code, codeKey: codeKeyOf(code) } : {}),
          ...(email !== undefined
            ? { email, emailKey: emailKeyOf(email) }
            : {}),
          ...(startDate !== undefined ? { startDate: dateOf(startDate) } : {}),
          version: { increment: 1 },
        },
      }),
    );
    if (result.count !== 1) {
      await this.get(id, tx);
      throw new ConflictException(
        "Nhân viên đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.get(id, tx);
  }
}
