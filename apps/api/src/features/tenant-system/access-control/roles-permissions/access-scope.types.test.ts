
import assert from "node:assert/strict";
import test from "node:test";

import {
  SYSTEM_ROLES,
  type AccessContext,
} from "./roles.types.js";

import {
  hasDepartmentManagementScope,
  hasTeamManagementScope,
  type ScopedAccessContext,
} from "./access-scope.types.js";

function makeContext(
  overrides: Partial<ScopedAccessContext> = {},
): ScopedAccessContext {
  const base: AccessContext = {
    userId: "user-001",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
    adminPermissions: [],
  };

  return {
    ...base,
    managementScope: {
      departmentIds: [],
      teamIds: [],
    },
    ...overrides,
  };
}

test("KAN-18: manager can manage assigned department", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: [],
    },
  });

  assert.equal(
    hasDepartmentManagementScope(context, "DEP-01"),
    true,
  );
});

test("KAN-18: manager cannot manage another department", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: [],
    },
  });

  assert.equal(
    hasDepartmentManagementScope(context, "DEP-02"),
    false,
  );
});

test("KAN-18: manager can manage assigned team", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: [],
      teamIds: ["TEAM-01"],
    },
  });

  assert.equal(
    hasTeamManagementScope(context, {
      id: "TEAM-01",
      departmentId: "DEP-01",
    }),
    true,
  );
});

test("KAN-18: department manager can manage its team", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: [],
    },
  });

  assert.equal(
    hasTeamManagementScope(context, {
      id: "TEAM-02",
      departmentId: "DEP-01",
    }),
    true,
  );
});

test("KAN-18: manager cannot manage unrelated team", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: ["TEAM-01"],
    },
  });

  assert.equal(
    hasTeamManagementScope(context, {
      id: "TEAM-99",
      departmentId: "DEP-99",
    }),
    false,
  );
});

test("KAN-18: employee has no management scope", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.EMPLOYEE,
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: ["TEAM-01"],
    },
  });

  assert.equal(
    hasDepartmentManagementScope(context, "DEP-01"),
    false,
  );

  assert.equal(
    hasTeamManagementScope(context, {
      id: "TEAM-01",
      departmentId: "DEP-01",
    }),
    false,
  );
});

test("KAN-18: super admin can manage valid scopes", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
  });

  assert.equal(
    hasDepartmentManagementScope(context, "DEP-99"),
    true,
  );

  assert.equal(
    hasTeamManagementScope(context, {
      id: "TEAM-99",
      departmentId: "DEP-99",
    }),
    true,
  );
});

test("KAN-18: employee cannot bypass using super admin flag", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.EMPLOYEE,
    isSuperAdmin: true,
  });

  assert.equal(
    hasDepartmentManagementScope(context, "DEP-01"),
    false,
  );
});

test("KAN-18: empty resource identifiers are rejected", () => {
  const context = makeContext({
    isSuperAdmin: true,
  });

  assert.equal(
    hasDepartmentManagementScope(context, ""),
    false,
  );

  assert.equal(
    hasTeamManagementScope(context, {
      id: "",
      departmentId: "DEP-01",
    }),
    false,
  );

  assert.equal(
    hasTeamManagementScope(context, {
      id: "TEAM-01",
      departmentId: "",
    }),
    false,
  );
});
