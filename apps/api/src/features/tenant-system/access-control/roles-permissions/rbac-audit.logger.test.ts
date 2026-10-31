import assert from "node:assert/strict";
import test from "node:test";

import {
  RBAC_AUDIT_ACTION_TYPES,
  createRbacAuditEntry,
  sanitizeAuditData,
  RbacAuditLogSink,
} from "./rbac-audit.logger.js";

test("KAN-52: creates audit entry for role change with timestamps (BR-PER-10)", () => {
  const entry = createRbacAuditEntry({
    actionType: RBAC_AUDIT_ACTION_TYPES.ROLE_CHANGE,
    actorId: "superadmin-01",
    targetId: "user-target",
    action: "GRANT_MANAGER",
    previousState: { role: "EMPLOYEE" },
    newState: { role: "MANAGER" },
  });

  assert.equal(entry.actionType, "ROLE_CHANGE");
  assert.equal(entry.actorId, "superadmin-01");
  assert.equal(entry.targetId, "user-target");
  assert.equal(entry.details.action, "GRANT_MANAGER");
  assert.ok(entry.timestamp);
});

test("KAN-52: sanitizes passwords and secret tokens (BR-ACC-09)", () => {
  const rawData = {
    username: "john_doe",
    password: "plainTextPassword123",
    apiSecret: "secretKey999",
    refreshToken: "token-abc",
    nested: {
      userPassword: "nestedPassword",
      safeField: "safeValue",
    },
  };

  const sanitized = sanitizeAuditData(rawData);

  assert.equal(sanitized.password, "[REDACTED]");
  assert.equal(sanitized.apiSecret, "[REDACTED]");
  assert.equal(sanitized.refreshToken, "[REDACTED]");
  assert.equal(sanitized.nested.userPassword, "[REDACTED]");
  assert.equal(sanitized.nested.safeField, "safeValue");
  assert.equal(sanitized.username, "john_doe");
});

test("KAN-52: sink provides append-only immutable audit history (BR-ORG-13)", () => {
  const sink = new RbacAuditLogSink();

  const entry1 = createRbacAuditEntry({
    actionType: RBAC_AUDIT_ACTION_TYPES.ROLE_CHANGE,
    actorId: "admin-1",
    targetId: "user-1",
    action: "GRANT_MANAGER",
  });

  const entry2 = createRbacAuditEntry({
    actionType: RBAC_AUDIT_ACTION_TYPES.PERMISSION_CHANGE,
    actorId: "admin-1",
    targetId: "user-1",
    action: "GRANT_PERMISSIONS",
  });

  const entry3 = createRbacAuditEntry({
    actionType: RBAC_AUDIT_ACTION_TYPES.ROLE_CHANGE,
    actorId: "admin-1",
    targetId: "user-2",
    action: "GRANT_MANAGER",
  });

  sink.append(entry1);
  sink.append(entry2);
  sink.append(entry3);

  const historyUser1 = sink.getHistoryForTarget("user-1");
  assert.equal(historyUser1.length, 2);

  const allHistory = sink.getAll();
  assert.equal(allHistory.length, 3);
});

test("KAN-52: sink rejects entries with empty actorId or targetId", () => {
  const sink = new RbacAuditLogSink();

  assert.throws(() => {
    sink.append({
      id: "entry-err",
      actionType: RBAC_AUDIT_ACTION_TYPES.ROLE_CHANGE,
      actorId: "",
      targetId: "user-1",
      details: { action: "TEST" },
      timestamp: new Date().toISOString(),
    });
  });
});
