import assert from "node:assert/strict";
import test from "node:test";

import {
  SYSTEM_ROLES,
  ADMIN_PERMISSIONS,
  type AccessContext,
} from "./roles.types.js";
import { modifyDelegatedPermissions } from "./delegated-permissions.policy.js";
import type { TargetUserProfile } from "./role-assignment.policy.js";

function makeAdminContext(
  overrides: Partial<AccessContext> = {},
): AccessContext {
  return {
    userId: "superadmin-01",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ROLES],
    ...overrides,
  };
}

test("KAN-20: authorized admin can grant admin permissions to a manager", () => {
  const actorContext = makeAdminContext();
  const targetUser: TargetUserProfile = {
    id: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    adminPermissions: [],
  };

  const decision = modifyDelegatedPermissions(
    {
      actorContext,
      targetUser,
      permissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
    },
    "GRANT",
  );

  assert.equal(decision.allowed, true);
  if (decision.allowed) {
    assert.deepEqual(decision.updatedPermissions, [
      ADMIN_PERMISSIONS.MANAGE_ACCOUNTS,
    ]);
    assert.equal(decision.auditRecord.action, "GRANT_PERMISSIONS");
  }
});

test("KAN-20: authorized admin can revoke admin permissions from a manager", () => {
  const actorContext = makeAdminContext();
  const targetUser: TargetUserProfile = {
    id: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    adminPermissions: [
      ADMIN_PERMISSIONS.MANAGE_ACCOUNTS,
      ADMIN_PERMISSIONS.MANAGE_SYSTEM_CONFIG,
    ],
  };

  const decision = modifyDelegatedPermissions(
    {
      actorContext,
      targetUser,
      permissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
    },
    "REVOKE",
  );

  assert.equal(decision.allowed, true);
  if (decision.allowed) {
    assert.deepEqual(decision.updatedPermissions, [
      ADMIN_PERMISSIONS.MANAGE_SYSTEM_CONFIG,
    ]);
    assert.equal(decision.auditRecord.action, "REVOKE_PERMISSIONS");
  }
});

test("KAN-20: authorized admin can sync whole permission set for a manager", () => {
  const actorContext = makeAdminContext();
  const targetUser: TargetUserProfile = {
    id: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
  };

  const decision = modifyDelegatedPermissions(
    {
      actorContext,
      targetUser,
      permissions: [ADMIN_PERMISSIONS.MANAGE_SYSTEM_CONFIG],
    },
    "SYNC",
  );

  assert.equal(decision.allowed, true);
  if (decision.allowed) {
    assert.deepEqual(decision.updatedPermissions, [
      ADMIN_PERMISSIONS.MANAGE_SYSTEM_CONFIG,
    ]);
    assert.equal(decision.auditRecord.action, "SYNC_PERMISSIONS");
  }
});

test("KAN-20: employee cannot receive admin permissions (BR-ACC-04, BR-PER-01)", () => {
  const actorContext = makeAdminContext();
  const targetUser: TargetUserProfile = {
    id: "emp-01",
    role: SYSTEM_ROLES.EMPLOYEE,
    adminPermissions: [],
  };

  const decision = modifyDelegatedPermissions(
    {
      actorContext,
      targetUser,
      permissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
    },
    "GRANT",
  );

  assert.equal(decision.allowed, false);
});

test("KAN-20: actor without MANAGE_ROLES cannot modify delegated permissions", () => {
  const unauthorizedActor = makeAdminContext({
    isSuperAdmin: false,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
  });
  const targetUser: TargetUserProfile = {
    id: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    adminPermissions: [],
  };

  const decision = modifyDelegatedPermissions(
    {
      actorContext: unauthorizedActor,
      targetUser,
      permissions: [ADMIN_PERMISSIONS.MANAGE_SYSTEM_CONFIG],
    },
    "GRANT",
  );

  assert.equal(decision.allowed, false);
});

test("KAN-20: invalid permission string is rejected", () => {
  const actorContext = makeAdminContext();
  const targetUser: TargetUserProfile = {
    id: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    adminPermissions: [],
  };

  const decision = modifyDelegatedPermissions(
    {
      actorContext,
      targetUser,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      permissions: ["INVALID_PERMISSION" as any],
    },
    "GRANT",
  );

  assert.equal(decision.allowed, false);
});
