import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import type { ActorContext } from "../../../../core/auth/actor-context.js";
import {
  changeAccessSchema,
  createAccountSchema,
  resetPasswordSchema,
  updateAccountSchema,
} from "./dto/accounts.dto.js";
import { AccountsRepository } from "./accounts.repository.js";
import type {
  AccessChange,
  AccountInput,
  AccountPatch,
  ListQuery,
  ResetPassword,
} from "./dto/accounts.dto.js";
export interface AccountCredential {
  accountId: string;
  username: string;
  displayName: string;
  employeeCode: string;
  role: "EMPLOYEE" | "MANAGER";
  isSystemAdmin: boolean;
  status: "ACTIVE" | "LOCKED";
  lockedReason: string;
  mustChangePassword: boolean;
}
export type OwnPasswordChange = "CHANGED" | "WRONG_PASSWORD" | "MISSING";
const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;
const hashPassword = async (password: string) => {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
};
const verifyPassword = async (password: string, stored: string) => {
  const [scheme, salt, key] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !key) return false;
  const computed = await scrypt(password, Buffer.from(salt, "hex"), 64);
  const expected = Buffer.from(key, "hex");
  return (
    computed.length === expected.length && timingSafeEqual(computed, expected)
  );
};
@Injectable()
export class AccountsService {
  constructor(private readonly repository: AccountsRepository) {}
  list(query: ListQuery) {
    return this.repository.list(query);
  }
  get(id: string) {
    return this.repository.get(id);
  }
  history(id: string) {
    return this.repository.history(id);
  }
  count() {
    return this.repository.count();
  }
  async create(input: AccountInput, actor?: ActorContext) {
    const parsed = new SchemaPipe(createAccountSchema).transform(input);
    if (parsed.isSystemAdmin && parsed.role !== "MANAGER")
      throw new UnprocessableEntityException(
        "Quản trị hệ thống phải là tài khoản Quản lý.",
      );
    const total = await this.repository.count();
    if (total === 0) {
      if (parsed.role !== "MANAGER" || !parsed.isSystemAdmin)
        throw new UnprocessableEntityException(
          "Tài khoản đầu tiên phải là Quản lý kèm quyền quản trị hệ thống.",
        );
    } else if (!actor?.isSystemAdmin) {
      throw new ForbiddenException(
        "Chỉ quản trị hệ thống mới tạo được tài khoản.",
      );
    }
    const actorName = actor?.displayName || parsed.actorName;
    const account = await this.repository.create(
      parsed,
      await hashPassword(parsed.password),
    );
    await this.repository.recordChange(
      account.id,
      "ROLE",
      "",
      account.role,
      actorName,
      "Tạo tài khoản",
    );
    if (account.isSystemAdmin)
      await this.repository.recordChange(
        account.id,
        "ADMIN",
        "false",
        "true",
        actorName,
        "Tạo tài khoản",
      );
    return account;
  }
  update(id: string, input: AccountPatch) {
    return this.repository.update(
      id,
      new SchemaPipe(updateAccountSchema).transform(input),
    );
  }
  changeAccess(id: string, input: AccessChange, actor?: ActorContext) {
    const parsed = new SchemaPipe(changeAccessSchema).transform(input);
    const actorName = actor?.displayName || parsed.actorName;
    return this.repository.transaction(async (tx) => {
      const current = await this.repository.get(id, tx);
      const role = parsed.role ?? current.role;
      const isSystemAdmin = parsed.isSystemAdmin ?? current.isSystemAdmin;
      const status = parsed.status ?? current.status;
      if (isSystemAdmin && role !== "MANAGER")
        throw new UnprocessableEntityException(
          "Quản trị hệ thống phải là tài khoản Quản lý.",
        );
      const losesAccess = status !== "ACTIVE";
      const losesManager =
        current.role === "MANAGER" && (role !== "MANAGER" || losesAccess);
      const losesAdmin =
        current.isSystemAdmin && (!isSystemAdmin || losesAccess);
      if (losesManager || losesAdmin) {
        const rest = await this.repository.activePrivilegeCounts(id, tx);
        if (losesManager && rest.managers === 0)
          throw new UnprocessableEntityException(
            "Không thể bớt Quản lý cuối cùng của hệ thống.",
          );
        if (losesAdmin && rest.admins === 0)
          throw new UnprocessableEntityException(
            "Không thể bớt quản trị hệ thống cuối cùng.",
          );
      }
      if (
        current.role === role &&
        current.isSystemAdmin === isSystemAdmin &&
        current.status === status &&
        current.lockedReason ===
          (status === "LOCKED"
            ? (parsed.lockedReason ?? current.lockedReason)
            : "")
      )
        return current;
      const updated = await this.repository.updateAccess(
        id,
        {
          role,
          isSystemAdmin,
          status,
          lockedReason: status === "LOCKED" ? (parsed.lockedReason ?? "") : "",
        },
        parsed.version,
        tx,
      );
      const reason = parsed.reason ?? "";
      const record = (
        kind: "ROLE" | "ADMIN" | "STATUS",
        from: string,
        to: string,
      ) =>
        this.repository.recordChange(id, kind, from, to, actorName, reason, tx);
      if (current.role !== role) await record("ROLE", current.role, role);
      if (current.isSystemAdmin !== isSystemAdmin)
        await record(
          "ADMIN",
          String(current.isSystemAdmin),
          String(isSystemAdmin),
        );
      if (current.status !== status)
        await record("STATUS", current.status, status);
      return updated;
    });
  }
  resetPassword(id: string, input: ResetPassword, actor?: ActorContext) {
    const parsed = new SchemaPipe(resetPasswordSchema).transform(input);
    const actorName = actor?.displayName || parsed.actorName;
    return this.repository.transaction(async (tx) => {
      const account = await this.repository.setPassword(
        id,
        await hashPassword(parsed.password),
        parsed.version,
        tx,
      );
      await this.repository.recordChange(
        id,
        "PASSWORD",
        "",
        "đã đặt lại",
        actorName,
        parsed.reason ?? "",
        tx,
      );
      return account;
    });
  }
  private credentialOf(row: {
    id: string;
    username: string;
    displayName: string;
    employeeCode: string;
    role: string;
    isSystemAdmin: boolean;
    status: string;
    lockedReason: string;
    mustChangePassword: boolean;
  }): AccountCredential {
    return {
      accountId: row.id,
      username: row.username,
      displayName: row.displayName,
      employeeCode: row.employeeCode,
      role: row.role === "MANAGER" ? "MANAGER" : "EMPLOYEE",
      isSystemAdmin: row.isSystemAdmin,
      status: row.status === "LOCKED" ? "LOCKED" : "ACTIVE",
      lockedReason: row.lockedReason,
      mustChangePassword: row.mustChangePassword,
    };
  }
  async verify(username: string, password: string) {
    const row = await this.repository.credentials(
      username.normalize("NFKC").toLowerCase(),
    );
    if (!row) return null;
    return (await verifyPassword(password, row.passwordHash))
      ? this.credentialOf(row)
      : null;
  }
  async credential(accountId: string) {
    const row = await this.repository.row(accountId);
    return row ? this.credentialOf(row) : null;
  }
  async changeOwnPassword(
    accountId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<OwnPasswordChange> {
    const row = await this.repository.row(accountId);
    if (!row) return "MISSING";
    if (!(await verifyPassword(currentPassword, row.passwordHash)))
      return "WRONG_PASSWORD";
    await this.repository.setOwnPassword(
      accountId,
      await hashPassword(newPassword),
    );
    await this.repository.recordChange(
      accountId,
      "PASSWORD",
      "",
      "tự đổi",
      row.displayName,
      "Người dùng tự đổi mật khẩu",
    );
    return "CHANGED";
  }
  async markSignedIn(accountId: string) {
    await this.repository.markSignedIn(accountId);
  }
}
