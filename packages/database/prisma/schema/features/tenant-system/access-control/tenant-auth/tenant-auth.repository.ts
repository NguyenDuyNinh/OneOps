import { Injectable } from "@nestjs/common";
import { Database } from "../../../../core/database/database.module.js";
import type { AuthSession } from "@oneops/database";

const IDLE_MINUTES = 30;
const TOUCH_SECONDS = 60;

@Injectable()
export class TenantAuthRepository {
  constructor(private readonly db: Database) {}

  idleMinutes() {
    return IDLE_MINUTES;
  }

  expiryFrom(now: Date) {
    return new Date(now.getTime() + IDLE_MINUTES * 60_000);
  }

  create(data: {
    accountId: string;
    tokenHash: string;
    agent: string;
    expiresAt: Date;
  }) {
    return this.db.authSession.create({ data });
  }

  find(tokenHash: string) {
    return this.db.authSession.findUnique({ where: { tokenHash } });
  }

  /** Sliding window: only write when the stored heartbeat is older than a minute. */
  async touch(session: AuthSession, now: Date) {
    if (now.getTime() - session.lastSeenAt.getTime() < TOUCH_SECONDS * 1_000)
      return session;
    return this.db.authSession.update({
      where: { id: session.id },
      data: { lastSeenAt: now, expiresAt: this.expiryFrom(now) },
    });
  }

  revoke(sessionId: string, now: Date) {
    return this.db.authSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  revokeAccount(accountId: string, now: Date, exceptSessionId = "") {
    return this.db.authSession.updateMany({
      where: {
        accountId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: now },
    });
  }

  prune(now: Date) {
    return this.db.authSession.deleteMany({
      where: { expiresAt: { lt: new Date(now.getTime() - 86_400_000) } },
    });
  }
}
