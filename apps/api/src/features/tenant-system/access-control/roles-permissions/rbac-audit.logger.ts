/**
 * KAN-52: RBAC Audit Logging
 *
 * BR-PER-10: Every grant/revoke of Manager role must record an audit entry
 * including actor, timestamp, affected account, and content of change.
 * BR-PER-11: Super Admin out-of-scope interventions must record actor, timestamp,
 * target resource, and change details.
 * BR-ACC-09: Never record password values in audit logs.
 * BR-ORG-13: Audit log records are immutable (no modification, no deletion).
 */

export const RBAC_AUDIT_ACTION_TYPES = {
  ROLE_CHANGE: "ROLE_CHANGE",
  PERMISSION_CHANGE: "PERMISSION_CHANGE",
  SUPER_ADMIN_INTERVENTION: "SUPER_ADMIN_INTERVENTION",
  ACCOUNT_STATUS_CHANGE: "ACCOUNT_STATUS_CHANGE",
} as const;

export type RbacAuditActionType =
  (typeof RBAC_AUDIT_ACTION_TYPES)[keyof typeof RBAC_AUDIT_ACTION_TYPES];

export interface RbacAuditEntry {
  id: string;
  actionType: RbacAuditActionType;
  actorId: string;
  targetId: string;
  details: {
    action: string;
    previousState?: unknown;
    newState?: unknown;
    reason?: string;
    metadata?: Record<string, unknown>;
  };
  timestamp: string;
}

/**
 * Sanitizes any object before saving to audit history.
 * Strips password, token, or secret fields (BR-ACC-09).
 */
export function sanitizeAuditData<T>(input: T): T {
  if (!input || typeof input !== "object") {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeAuditData(item)) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes("password") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("token")
    ) {
      sanitized[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      sanitized[key] = sanitizeAuditData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

export function createRbacAuditEntry(params: {
  id?: string;
  actionType: RbacAuditActionType;
  actorId: string;
  targetId: string;
  action: string;
  previousState?: unknown;
  newState?: unknown;
  reason?: string;
  metadata?: Record<string, unknown>;
}): RbacAuditEntry {
  const id =
    params.id ||
    `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    actionType: params.actionType,
    actorId: params.actorId.trim(),
    targetId: params.targetId.trim(),
    details: {
      action: params.action.trim(),
      previousState: sanitizeAuditData(params.previousState),
      newState: sanitizeAuditData(params.newState),
      reason: params.reason?.trim(),
      metadata: sanitizeAuditData(params.metadata),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * In-memory repository / sink interface for RBAC audit logs.
 * Guarantees immutability (BR-ORG-13).
 */
export class RbacAuditLogSink {
  private readonly records: RbacAuditEntry[] = [];

  public append(entry: RbacAuditEntry): void {
    if (!entry.actorId || !entry.targetId) {
      throw new Error("Audit entry must specify valid actorId and targetId");
    }
    // Append-only storage (BR-ORG-13)
    this.records.push(Object.freeze({ ...entry }));
  }

  public getHistoryForTarget(targetId: string): readonly RbacAuditEntry[] {
    return this.records.filter((r) => r.targetId === targetId);
  }

  public getAll(): readonly RbacAuditEntry[] {
    return [...this.records];
  }
}
