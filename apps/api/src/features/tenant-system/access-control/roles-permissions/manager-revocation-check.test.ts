import assert from "node:assert/strict";
import test from "node:test";

import {
  SYSTEM_ROLES,
  ADMIN_PERMISSIONS,
  type AccessContext,
} from "./roles.types.js";
import {
  canRevokeManagerRole,
  type ManagedDepartmentInfo,
  type ManagedTeamInfo,
} from "./manager-revocation-check.js";

function makeContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    userId: "admin-001",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ROLES],
    ...overrides,
  };
}

const sampleDepartments: ManagedDepartmentInfo[] = [
  {
    id: "DEP-01",
    name: "Engineering",
    managerIds: ["user-target", "user-other"],
  },
  {
    id: "DEP-02",
    name: "Human Resources",
    managerIds: ["user-sole-dept"],
  },
];

const sampleTeams: ManagedTeamInfo[] = [
  {
    id: "TEAM-01",
    name: "Frontend",
    departmentId: "DEP-01",
    managerIds: ["user-target", "user-other"],
  },
  {
    id: "TEAM-02",
    name: "Backend",
    departmentId: "DEP-01",
    managerIds: ["user-sole-team"],
  },
];

test("KAN-50: authorized admin can revoke manager when replacement exists", () => {
  const actorContext = makeContext();

  const decision = canRevokeManagerRole({
    actorContext,
    targetUserId: "user-target",
    activeDepartments: sampleDepartments,
    activeTeams: sampleTeams,
  });

  assert.equal(decision.allowed, true);
});

test("KAN-50: blocks revoking manager who is sole department admin (BR-ORG-03, BR-ORG-18)", () => {
  const actorContext = makeContext();

  const decision = canRevokeManagerRole({
    actorContext,
    targetUserId: "user-sole-dept",
    activeDepartments: sampleDepartments,
    activeTeams: sampleTeams,
  });

  assert.equal(decision.allowed, false);
  if (!decision.allowed) {
    assert.equal(decision.blockingDepartments?.length, 1);
    assert.equal(decision.blockingDepartments?.[0].id, "DEP-02");
  }
});

test("KAN-50: blocks revoking manager who is sole team manager (BR-ORG-03, BR-ORG-18)", () => {
  const actorContext = makeContext();

  const decision = canRevokeManagerRole({
    actorContext,
    targetUserId: "user-sole-team",
    activeDepartments: sampleDepartments,
    activeTeams: sampleTeams,
  });

  assert.equal(decision.allowed, false);
  if (!decision.allowed) {
    assert.equal(decision.blockingTeams?.length, 1);
    assert.equal(decision.blockingTeams?.[0].id, "TEAM-02");
  }
});

test("KAN-50: blocks revoking self to prevent lockout", () => {
  const actorContext = makeContext({ userId: "admin-001" });

  const decision = canRevokeManagerRole({
    actorContext,
    targetUserId: "admin-001",
    activeDepartments: [],
    activeTeams: [],
  });

  assert.equal(decision.allowed, false);
  if (!decision.allowed) {
    assert.match(decision.reason, /cannot revoke their own/);
  }
});

test("KAN-50: actor without MANAGE_ROLES cannot revoke manager (BR-PER-03)", () => {
  const normalManager = makeContext({
    isSuperAdmin: false,
    adminPermissions: [],
  });

  const decision = canRevokeManagerRole({
    actorContext: normalManager,
    targetUserId: "user-target",
    activeDepartments: sampleDepartments,
    activeTeams: sampleTeams,
  });

  assert.equal(decision.allowed, false);
  if (!decision.allowed) {
    assert.match(decision.reason, /MANAGE_ROLES/);
  }
});

test("KAN-50: employee cannot revoke manager (BR-PER-03)", () => {
  const employeeContext = makeContext({
    role: SYSTEM_ROLES.EMPLOYEE,
    isSuperAdmin: false,
    adminPermissions: [],
  });

  const decision = canRevokeManagerRole({
    actorContext: employeeContext,
    targetUserId: "user-target",
    activeDepartments: sampleDepartments,
    activeTeams: sampleTeams,
  });

  assert.equal(decision.allowed, false);
});

test("KAN-50: empty target user ID is rejected", () => {
  const actorContext = makeContext();

  const decision = canRevokeManagerRole({
    actorContext,
    targetUserId: "",
    activeDepartments: [],
    activeTeams: [],
  });

  assert.equal(decision.allowed, false);
});
