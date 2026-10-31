import assert from "node:assert/strict";
import test from "node:test";

import {
  SYSTEM_ROLES,
  ADMIN_PERMISSIONS,
  type AccessContext,
} from "./roles.types.js";
import {
  executeRoleAssignment,
  type TargetUserProfile,
} from "./role-assignment.policy.js";
import type {
  ManagedDepartmentInfo,
  ManagedTeamInfo,
} from "./manager-revocation-check.js";

function makeAdminContext(
  overrides: Partial<AccessContext> = {},
): AccessContext {
  return {
    userId: "admin-001",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ROLES],
    ...overrides,
  };
}

const safeDepartments: ManagedDepartmentInfo[] = [
  {
    id: "DEP-01",
    name: "Engineering",
    managerIds: ["user-target", "user-other"],
  },
];

const safeTeams: ManagedTeamInfo[] = [
  {
    id: "TEAM-01",
    name: "Frontend",
    departmentId: "DEP-01",
    managerIds: ["user-target", "user-other"],
  },
];

test("KAN-17: authorized admin can grant MANAGER role to EMPLOYEE (BR-PER-03)", () => {
  const actorContext = makeAdminContext();
  const targetUser: TargetUserProfile = {
    id: "user-target",
    role: SYSTEM_ROLES.EMPLOYEE,
    adminPermissions: [],
  };

  const decision = executeRoleAssignment({
    actorContext,
    targetUser,
    newRole: SYSTEM_ROLES.MANAGER,
  });

  assert.equal(decision.allowed, true);
  if (decision.allowed) {
    assert.equal(decision.updatedRole, SYSTEM_ROLES.MANAGER);
    // BR-ACC-04: manager has no automatic admin rights
    assert.deepEqual(decision.updatedAdminPermissions, []);
    assert.equal(decision.auditRecord.action, "GRANT_MANAGER");
    assert.equal(decision.auditRecord.targetUserId, "user-target");
  }
});

test("KAN-17: authorized admin can revoke MANAGER role when safe (BR-PER-03, KAN-50)", () => {
  const actorContext = makeAdminContext();
  const targetUser: TargetUserProfile = {
    id: "user-target",
    role: SYSTEM_ROLES.MANAGER,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
  };

  const decision = executeRoleAssignment({
    actorContext,
    targetUser,
    newRole: SYSTEM_ROLES.EMPLOYEE,
    activeDepartments: safeDepartments,
    activeTeams: safeTeams,
  });

  assert.equal(decision.allowed, true);
  if (decision.allowed) {
    assert.equal(decision.updatedRole, SYSTEM_ROLES.EMPLOYEE);
    // admin permissions must be cleared on becoming employee
    assert.deepEqual(decision.updatedAdminPermissions, []);
    assert.equal(decision.auditRecord.action, "REVOKE_MANAGER");
  }
});

test("KAN-17: blocks revoking MANAGER if user is sole manager of a department (KAN-50)", () => {
  const actorContext = makeAdminContext();
  const targetUser: TargetUserProfile = {
    id: "user-sole-dept",
    role: SYSTEM_ROLES.MANAGER,
    adminPermissions: [],
  };

  const blockingDepartments: ManagedDepartmentInfo[] = [
    {
      id: "DEP-SOLE",
      name: "Operations",
      managerIds: ["user-sole-dept"],
    },
  ];

  const decision = executeRoleAssignment({
    actorContext,
    targetUser,
    newRole: SYSTEM_ROLES.EMPLOYEE,
    activeDepartments: blockingDepartments,
    activeTeams: [],
  });

  assert.equal(decision.allowed, false);
});

test("KAN-17: rejects re-assigning the same role", () => {
  const actorContext = makeAdminContext();
  const targetUser: TargetUserProfile = {
    id: "user-target",
    role: SYSTEM_ROLES.EMPLOYEE,
    adminPermissions: [],
  };

  const decision = executeRoleAssignment({
    actorContext,
    targetUser,
    newRole: SYSTEM_ROLES.EMPLOYEE,
  });

  assert.equal(decision.allowed, false);
});

test("KAN-17: unauthorized actor cannot assign roles", () => {
  const unauthorizedContext = makeAdminContext({
    isSuperAdmin: false,
    adminPermissions: [],
  });
  const targetUser: TargetUserProfile = {
    id: "user-target",
    role: SYSTEM_ROLES.EMPLOYEE,
    adminPermissions: [],
  };

  const decision = executeRoleAssignment({
    actorContext: unauthorizedContext,
    targetUser,
    newRole: SYSTEM_ROLES.MANAGER,
  });

  assert.equal(decision.allowed, false);
});
