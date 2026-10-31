import assert from "node:assert/strict";
import test from "node:test";

import { SYSTEM_ROLES, ADMIN_PERMISSIONS } from "./roles.types.js";
import {
  buildEffectiveAccessContext,
  applyAuthorizationUpdate,
} from "./access-context-sync.js";

test("KAN-49: employee context has zero admin permissions", () => {
  const context = buildEffectiveAccessContext({
    userId: "emp-01",
    role: SYSTEM_ROLES.EMPLOYEE,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS], // attempts to set permissions
  });

  assert.equal(context.role, SYSTEM_ROLES.EMPLOYEE);
  assert.equal(context.isSuperAdmin, false);
  assert.equal(context.isActive, true);
  assert.equal(context.isLocked, false);
  assert.deepEqual(context.adminPermissions, []);
});

test("KAN-49: locked account strips all rights (BR-ACC-05, BR-PER-08)", () => {
  const context = buildEffectiveAccessContext({
    userId: "user-locked",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
    isLocked: true,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
    departmentIds: ["DEP-01"],
  });

  assert.equal(context.isActive, false);
  assert.equal(context.isLocked, true);
  assert.equal(context.isSuperAdmin, false);
  assert.deepEqual(context.adminPermissions, []);
  assert.deepEqual(context.managementScope.departmentIds, []);
});

test("KAN-49: normal manager receives only explicitly granted permissions (BR-ACC-04)", () => {
  const context = buildEffectiveAccessContext({
    userId: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
    departmentIds: ["DEP-01"],
    teamIds: ["TEAM-01"],
  });

  assert.equal(context.role, SYSTEM_ROLES.MANAGER);
  assert.equal(context.isSuperAdmin, false);
  assert.deepEqual(context.adminPermissions, [
    ADMIN_PERMISSIONS.MANAGE_ACCOUNTS,
  ]);
  assert.deepEqual(context.managementScope.departmentIds, ["DEP-01"]);
  assert.deepEqual(context.managementScope.teamIds, ["TEAM-01"]);
});

test("KAN-49: super admin receives elevated rights across all admin permissions", () => {
  const context = buildEffectiveAccessContext({
    userId: "super-01",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
  });

  assert.equal(context.role, SYSTEM_ROLES.MANAGER);
  assert.equal(context.isSuperAdmin, true);
  assert.equal(
    context.adminPermissions.includes(ADMIN_PERMISSIONS.MANAGE_ROLES),
    true,
  );
  assert.equal(
    context.adminPermissions.includes(ADMIN_PERMISSIONS.MANAGE_ACCOUNTS),
    true,
  );
  assert.equal(
    context.adminPermissions.includes(ADMIN_PERMISSIONS.MANAGE_SYSTEM_CONFIG),
    true,
  );
});

test("KAN-49: dynamic role change updates permissions immediately", () => {
  // 1. Initially an employee
  const employeeContext = buildEffectiveAccessContext({
    userId: "user-promotee",
    role: SYSTEM_ROLES.EMPLOYEE,
  });
  assert.equal(employeeContext.role, SYSTEM_ROLES.EMPLOYEE);
  assert.deepEqual(employeeContext.adminPermissions, []);

  // 2. Admin promotes to Manager with account management
  const managerContext = applyAuthorizationUpdate(employeeContext, {
    role: SYSTEM_ROLES.MANAGER,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
    departmentIds: ["DEP-01"],
  });

  assert.equal(managerContext.role, SYSTEM_ROLES.MANAGER);
  assert.deepEqual(managerContext.adminPermissions, [
    ADMIN_PERMISSIONS.MANAGE_ACCOUNTS,
  ]);
  assert.deepEqual(managerContext.managementScope.departmentIds, ["DEP-01"]);

  // 3. Admin revokes role back to Employee
  const demotedContext = applyAuthorizationUpdate(managerContext, {
    role: SYSTEM_ROLES.EMPLOYEE,
  });
  assert.equal(demotedContext.role, SYSTEM_ROLES.EMPLOYEE);
  assert.deepEqual(demotedContext.adminPermissions, []);
});

test("KAN-49: unlocking account restores current permissions", () => {
  const lockedContext = buildEffectiveAccessContext({
    userId: "user-01",
    role: SYSTEM_ROLES.MANAGER,
    isLocked: true,
  });
  assert.equal(lockedContext.isActive, false);

  const unlockedContext = applyAuthorizationUpdate(lockedContext, {
    isLocked: false,
    role: SYSTEM_ROLES.MANAGER,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_SYSTEM_CONFIG],
  });

  assert.equal(unlockedContext.isActive, true);
  assert.equal(unlockedContext.isLocked, false);
  assert.deepEqual(unlockedContext.adminPermissions, [
    ADMIN_PERMISSIONS.MANAGE_SYSTEM_CONFIG,
  ]);
});
