
import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_PERMISSIONS,
  SYSTEM_ROLES,
  hasAdminPermission,
  isAdminPermission,
  isSystemRole,
  type AccessContext,
} from "./roles.types.js";

function makeContext(
  overrides: Partial<AccessContext> = {},
): AccessContext {
  return {
    userId: "user-001",
    role: SYSTEM_ROLES.EMPLOYEE,
    isSuperAdmin: false,
    adminPermissions: [],
    ...overrides,
  };
}

test("KAN-16: system has exactly two roles", () => {
  assert.deepEqual(Object.values(SYSTEM_ROLES), [
    "EMPLOYEE",
    "MANAGER",
  ]);
});

test("KAN-16: accepts valid system roles", () => {
  assert.equal(isSystemRole("EMPLOYEE"), true);
  assert.equal(isSystemRole("MANAGER"), true);
});

test("KAN-16: rejects unknown roles and job titles", () => {
  for (const value of [
    "SUPER_ADMIN",
    "HR_MANAGER",
    "PROJECT_MANAGER",
    "TEAM_LEAD",
    "DEVELOPER",
    "TESTER",
    "BA",
    "DESIGNER",
    "",
    null,
    undefined,
    123,
  ]) {
    assert.equal(isSystemRole(value), false);
  }
});

test("KAN-16: accepts only defined admin permissions", () => {
  for (const permission of Object.values(
    ADMIN_PERMISSIONS,
  )) {
    assert.equal(isAdminPermission(permission), true);
  }

  assert.equal(
    isAdminPermission("UNKNOWN_PERMISSION"),
    false,
  );
});

test("KAN-16: employee has no admin permissions", () => {
  const context = makeContext({
    adminPermissions: [
      ADMIN_PERMISSIONS.MANAGE_ROLES,
    ],
  });

  assert.equal(
    hasAdminPermission(
      context,
      ADMIN_PERMISSIONS.MANAGE_ROLES,
    ),
    false,
  );
});

test("KAN-16: manager has no automatic admin rights", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.MANAGER,
  });

  assert.equal(
    hasAdminPermission(
      context,
      ADMIN_PERMISSIONS.MANAGE_ACCOUNTS,
    ),
    false,
  );
});

test("KAN-16: manager can use explicitly granted permission", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.MANAGER,
    adminPermissions: [
      ADMIN_PERMISSIONS.MANAGE_ROLES,
    ],
  });

  assert.equal(
    hasAdminPermission(
      context,
      ADMIN_PERMISSIONS.MANAGE_ROLES,
    ),
    true,
  );

  assert.equal(
    hasAdminPermission(
      context,
      ADMIN_PERMISSIONS.MANAGE_SYSTEM_CONFIG,
    ),
    false,
  );
});

test("KAN-16: super admin is a manager with elevated rights", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
  });

  for (const permission of Object.values(
    ADMIN_PERMISSIONS,
  )) {
    assert.equal(
      hasAdminPermission(context, permission),
      true,
    );
  }
});

test("KAN-16: employee cannot gain super admin rights", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.EMPLOYEE,
    isSuperAdmin: true,
  });

  assert.equal(
    hasAdminPermission(
      context,
      ADMIN_PERMISSIONS.MANAGE_ROLES,
    ),
    false,
  );
});
