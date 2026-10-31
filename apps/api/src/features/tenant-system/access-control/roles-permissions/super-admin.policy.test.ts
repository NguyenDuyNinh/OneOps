import assert from "node:assert/strict";
import test from "node:test";

import { SYSTEM_ROLES, type AccessContext } from "./roles.types.js";
import {
  SUPER_ADMIN_RESOURCE_TYPES,
  isValidSuperAdmin,
  evaluateSuperAdminAccess,
} from "./super-admin.policy.js";

function makeContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    userId: "admin-001",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
    adminPermissions: [],
    ...overrides,
  };
}

test("KAN-51: manager with isSuperAdmin is a valid super admin", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
  });

  assert.equal(isValidSuperAdmin(context), true);
});

test("KAN-51: normal manager is not a super admin", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
  });

  assert.equal(isValidSuperAdmin(context), false);
});

test("KAN-51: employee cannot be a super admin even if flag is set (BR-PER-01)", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.EMPLOYEE,
    isSuperAdmin: true,
  });

  assert.equal(isValidSuperAdmin(context), false);
});

test("KAN-51: empty or missing user ID is not a valid super admin", () => {
  const context = makeContext({
    userId: "",
    isSuperAdmin: true,
  });

  assert.equal(isValidSuperAdmin(context), false);
});

test("KAN-51: direct access does not trigger elevated bypass for super admin", () => {
  const context = makeContext({
    isSuperAdmin: true,
  });

  const decision = evaluateSuperAdminAccess({
    context,
    resourceType: SUPER_ADMIN_RESOURCE_TYPES.DEPARTMENT,
    resourceId: "DEP-01",
    action: "UPDATE_DEPARTMENT",
    hasDirectAccess: () => true,
  });

  assert.equal(decision.allowed, true);
  assert.equal(decision.isElevatedBypass, false);
  assert.equal("auditRecord" in decision, false);
});

test("KAN-51: super admin outside scope is granted elevated bypass with audit record (BR-PER-11, BR-ORG-19)", () => {
  const context = makeContext({
    userId: "superadmin-99",
    isSuperAdmin: true,
  });

  const decision = evaluateSuperAdminAccess({
    context,
    resourceType: SUPER_ADMIN_RESOURCE_TYPES.TEAM,
    resourceId: "TEAM-OUT-OF-SCOPE",
    action: "CHANGE_TEAM_MANAGER",
    hasDirectAccess: () => false,
    details: { oldManagerId: "user-1", newManagerId: "user-2" },
  });

  assert.equal(decision.allowed, true);
  assert.equal(decision.isElevatedBypass, true);
  if (decision.isElevatedBypass) {
    assert.equal(decision.auditRecord.actorId, "superadmin-99");
    assert.equal(decision.auditRecord.resourceType, "TEAM");
    assert.equal(decision.auditRecord.resourceId, "TEAM-OUT-OF-SCOPE");
    assert.equal(decision.auditRecord.action, "CHANGE_TEAM_MANAGER");
    assert.equal(decision.auditRecord.details?.oldManagerId, "user-1");
    assert.equal(decision.auditRecord.details?.newManagerId, "user-2");
    assert.ok(decision.auditRecord.timestamp);
  }
});

test("KAN-51: normal manager outside scope is denied (no bypass)", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
  });

  const decision = evaluateSuperAdminAccess({
    context,
    resourceType: SUPER_ADMIN_RESOURCE_TYPES.TEAM,
    resourceId: "TEAM-99",
    action: "CHANGE_TEAM_MANAGER",
    hasDirectAccess: () => false,
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.isElevatedBypass, false);
});

test("KAN-51: employee outside scope is denied (no bypass)", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.EMPLOYEE,
    isSuperAdmin: false,
  });

  const decision = evaluateSuperAdminAccess({
    context,
    resourceType: SUPER_ADMIN_RESOURCE_TYPES.TASK,
    resourceId: "TASK-01",
    action: "REASSIGN_TASK",
    hasDirectAccess: () => false,
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.isElevatedBypass, false);
});

test("KAN-51: empty resource ID or action is rejected", () => {
  const context = makeContext({ isSuperAdmin: true });

  const decisionEmptyResource = evaluateSuperAdminAccess({
    context,
    resourceType: SUPER_ADMIN_RESOURCE_TYPES.TEAM,
    resourceId: "",
    action: "CHANGE_TEAM_MANAGER",
    hasDirectAccess: () => false,
  });
  assert.equal(decisionEmptyResource.allowed, false);

  const decisionEmptyAction = evaluateSuperAdminAccess({
    context,
    resourceType: SUPER_ADMIN_RESOURCE_TYPES.TEAM,
    resourceId: "TEAM-01",
    action: "   ",
    hasDirectAccess: () => false,
  });
  assert.equal(decisionEmptyAction.allowed, false);
});
