import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import type { ActorContext } from "../../../../core/auth/actor-context.js";
import {
  loginSchema,
  passwordChangeSchema,
  sessionResultSchema,
} from "./dto/tenant-auth.dto.js";
import type {
  LoginInput,
  PasswordChangeInput,
  SessionResult,
} from "./dto/tenant-auth.dto.js";
import { CREDENTIALS } from "./credentials.port.js";
import type { CredentialAccount, CredentialsPort } from "./credentials.port.js";
import { TenantAuthRepository } from "./tenant-auth.repository.js";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

@Injectable()
export class TenantAuthService {
  constructor(
    private readonly repository: TenantAuthRepository,
    @Inject(CREDENTIALS) private readonly credentials: CredentialsPort,
  ) {}

  private actorOf(
    sessionId: string,
    account: CredentialAccount,
  ): ActorContext & { mustChangePassword: boolean; username: string } {
    return {
      accountId: account.accountId,
      employeeId: account.employeeCode,
      displayName: account.displayName,
      role: account.role,
      isSystemAdmin: account.isSystemAdmin,
      sessionId,
      username: account.username,
      mustChangePassword: account.mustChangePassword,
    };
  }

  private sessionResult(
    session: { id: string; expiresAt: Date },
    account: CredentialAccount,
  ): SessionResult {
    return sessionResultSchema.parse({
      actor: this.actorOf(session.id, account),
      idleMinutes: this.repository.idleMinutes(),
      expiresAt: session.expiresAt.toISOString(),
    });
  }

  /** Public probe used by the sign-in screen to offer first-run account creation. */
  async setup() {
    const total = await this.credentials.count();
    return {
      needsSetup: total === 0,
      idleMinutes: this.repository.idleMinutes(),
    };
  }

  async login(input: LoginInput, agent: string) {
    const parsed = new SchemaPipe(loginSchema).transform(input);
    const account = await this.credentials.verify(
      parsed.username,
      parsed.password,
    );
    if (!account)
      throw new UnauthorizedException(
        "Tên đăng nhập hoặc mật khẩu không đúng.",
      );
    if (account.status !== "ACTIVE")
      throw new ForbiddenException(
        account.lockedReason
          ? `Tài khoản đã bị khóa: ${account.lockedReason}`
          : "Tài khoản đã bị khóa. Liên hệ quản trị hệ thống.",
      );
    const token = randomBytes(32).toString("base64url");
    const now = new Date();
    const session = await this.repository.create({
      accountId: account.accountId,
      tokenHash: hashToken(token),
      agent: agent.slice(0, 300),
      expiresAt: this.repository.expiryFrom(now),
    });
    await this.credentials.markSignedIn(account.accountId);
    await this.repository.prune(now);
    return { token, result: this.sessionResult(session, account) };
  }

  /** Returns the actor for a signed cookie, or null when the session is gone. */
  async resolve(token: string): Promise<ActorContext | null> {
    const session = await this.repository.find(hashToken(token));
    if (!session || session.revokedAt) return null;
    const now = new Date();
    if (session.expiresAt.getTime() <= now.getTime()) {
      await this.repository.revoke(session.id, now);
      return null;
    }
    const account = await this.credentials.account(session.accountId);
    if (!account || account.status !== "ACTIVE") {
      await this.repository.revoke(session.id, now);
      return null;
    }
    const touched = await this.repository.touch(session, now);
    return this.actorOf(touched.id, account);
  }

  async session(token: string) {
    const session = await this.repository.find(hashToken(token));
    if (!session || session.revokedAt)
      throw new UnauthorizedException(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      );
    if (session.expiresAt.getTime() <= Date.now()) {
      await this.repository.revoke(session.id, new Date());
      throw new UnauthorizedException(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      );
    }
    const account = await this.credentials.account(session.accountId);
    if (!account || account.status !== "ACTIVE") {
      await this.repository.revoke(session.id, new Date());
      throw new UnauthorizedException(
        "Tài khoản không còn hoạt động. Vui lòng liên hệ quản trị hệ thống.",
      );
    }
    const touched = await this.repository.touch(session, new Date());
    return this.sessionResult(touched, account);
  }

  async logout(token: string) {
    const session = await this.repository.find(hashToken(token));
    if (session) await this.repository.revoke(session.id, new Date());
    return { signedOut: true };
  }

  async changePassword(
    actor: ActorContext,
    input: PasswordChangeInput,
    token: string,
  ) {
    const parsed = new SchemaPipe(passwordChangeSchema).transform(input);
    const outcome = await this.credentials.changePassword(
      actor.accountId,
      parsed.currentPassword,
      parsed.newPassword,
    );
    if (outcome === "MISSING")
      throw new UnauthorizedException("Không tìm thấy tài khoản.");
    if (outcome === "WRONG_PASSWORD")
      throw new UnprocessableEntityException("Mật khẩu hiện tại không đúng.");
    const session = await this.repository.find(hashToken(token));
    await this.repository.revokeAccount(
      actor.accountId,
      new Date(),
      session?.id ?? "",
    );
    return { changed: true };
  }
}
