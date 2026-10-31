import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {
  Database,
  type Transaction,
} from "../../../../core/database/database.module.js";
import {
  Prisma,
  type Account,
  type AccountAccessChange,
} from "@oneops/database";
import { accessChangeSchema, accountSchema } from "./dto/accounts.dto.js";
import type {
  AccountDto,
  AccountInput,
  AccountPatch,
  AccessChangeKind,
  ListQuery,
} from "./dto/accounts.dto.js";
const keyOf = (value: string) => value.normalize("NFKC").toLowerCase();
const emailKeyOf = (email: string) =>
  email ? email.normalize("NFKC").toLowerCase() : null;
@Injectable()
export class AccountsRepository {
  constructor(private readonly db: Database) {}
  private accounts(tx: Transaction = this.db) {
    return tx.account;
  }
  private changes(tx: Transaction = this.db) {
    return tx.accountAccessChange;
  }
  transaction<T>(run: (tx: Transaction) => Promise<T>) {
    return this.db.$transaction(run, {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    });
  }
  dto(row: Account): AccountDto {
    return accountSchema.parse({
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      email: row.email,
      employeeCode: row.employeeCode,
      role: row.role,
      isSystemAdmin: row.isSystemAdmin,
      status: row.status,
      lockedReason: row.lockedReason,
      mustChangePassword: row.mustChangePassword,
      lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }
  private changeDto(row: AccountAccessChange) {
    return accessChangeSchema.parse({
      id: row.id,
      kind: row.kind,
      fromValue: row.fromValue,
      toValue: row.toValue,
      actorName: row.actorName,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
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
            ? "Email đã được dùng cho tài khoản khác."
            : "Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.",
        );
      }
      throw error;
    }
  }
  async list(query: ListQuery) {
    const where: Prisma.AccountWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { username: { contains: query.q, mode: "insensitive" } },
              { displayName: { contains: query.q, mode: "insensitive" } },
              { email: { contains: query.q, mode: "insensitive" } },
              { employeeCode: { contains: query.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    return this.db.$transaction(
      async (tx) => ({
        items: (
          await this.accounts(tx).findMany({
            where,
            orderBy: [{ status: "asc" }, { displayName: "asc" }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
          })
        ).map((row) => this.dto(row)),
        total: await this.accounts(tx).count({ where }),
        page: query.page,
        pageSize: query.pageSize,
      }),
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
  async get(id: string, tx: Transaction = this.db) {
    const row = await this.accounts(tx).findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy tài khoản.");
    return this.dto(row);
  }
  count() {
    return this.accounts().count();
  }
  /** Raw row for credential checks; never leaves the feature. */
  credentials(usernameKey: string) {
    return this.accounts().findUnique({ where: { usernameKey } });
  }
  row(id: string) {
    return this.accounts().findUnique({ where: { id } });
  }
  async setOwnPassword(id: string, passwordHash: string) {
    const result = await this.accounts().updateMany({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: false,
        version: { increment: 1 },
      },
    });
    if (result.count !== 1)
      throw new NotFoundException("Không tìm thấy tài khoản.");
    return this.get(id);
  }
  markSignedIn(id: string) {
    return this.accounts().update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
  async create(
    input: AccountInput,
    passwordHash: string,
    tx: Transaction = this.db,
  ) {
    return this.dto(
      await this.unique(() =>
        this.accounts(tx).create({
          data: {
            username: input.username,
            usernameKey: keyOf(input.username),
            displayName: input.displayName,
            email: input.email,
            emailKey: emailKeyOf(input.email ?? ""),
            employeeCode: input.employeeCode,
            role: input.role,
            isSystemAdmin: input.isSystemAdmin,
            status: input.status,
            lockedReason: input.lockedReason,
            passwordHash,
            lastLoginAt: null,
          },
        }),
      ),
    );
  }
  async update(id: string, patch: AccountPatch, tx: Transaction = this.db) {
    const { version, username, email, ...rest } = patch;
    const result = await this.unique(() =>
      this.accounts(tx).updateMany({
        where: { id, version },
        data: {
          ...rest,
          ...(username ? { username, usernameKey: keyOf(username) } : {}),
          ...(email !== undefined
            ? { email, emailKey: emailKeyOf(email) }
            : {}),
          version: { increment: 1 },
        },
      }),
    );
    if (result.count !== 1) {
      await this.get(id, tx);
      throw new ConflictException(
        "Tài khoản đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.get(id, tx);
  }
  async updateAccess(
    id: string,
    data: {
      role: string;
      isSystemAdmin: boolean;
      status: string;
      lockedReason: string;
    },
    version: number,
    tx: Transaction = this.db,
  ) {
    const result = await this.accounts(tx).updateMany({
      where: { id, version },
      data: { ...data, version: { increment: 1 } },
    });
    if (result.count !== 1) {
      await this.get(id, tx);
      throw new ConflictException(
        "Tài khoản đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.get(id, tx);
  }
  async setPassword(
    id: string,
    passwordHash: string,
    version: number,
    tx: Transaction = this.db,
  ) {
    const result = await this.accounts(tx).updateMany({
      where: { id, version },
      data: {
        passwordHash,
        mustChangePassword: true,
        version: { increment: 1 },
      },
    });
    if (result.count !== 1) {
      await this.get(id, tx);
      throw new ConflictException(
        "Tài khoản đã thay đổi. Vui lòng tải lại trước khi lưu.",
      );
    }
    return this.get(id, tx);
  }
  async activePrivilegeCounts(excludeId: string, tx: Transaction = this.db) {
    const where = { status: "ACTIVE", id: { not: excludeId } };
    const [managers, admins] = await Promise.all([
      this.accounts(tx).count({ where: { ...where, role: "MANAGER" } }),
      this.accounts(tx).count({ where: { ...where, isSystemAdmin: true } }),
    ]);
    return { managers, admins };
  }
  recordChange(
    accountId: string,
    kind: AccessChangeKind,
    fromValue: string,
    toValue: string,
    actorName: string,
    reason: string,
    tx: Transaction = this.db,
  ) {
    return this.changes(tx).create({
      data: { accountId, kind, fromValue, toValue, actorName, reason },
    });
  }
  async history(accountId: string) {
    await this.get(accountId);
    const rows = await this.changes().findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return { items: rows.map((row) => this.changeDto(row)) };
  }
}
