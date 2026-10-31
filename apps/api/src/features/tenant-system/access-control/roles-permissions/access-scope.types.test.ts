import assert from "node:assert/strict";
import test from "node:test";

import { SYSTEM_ROLES, type AccessContext } from "./roles.types.js";

import {
  hasDepartmentManagementScope,
  hasTeamManagementScope,
  hasProjectManagementScope,
  hasEmployeeManagementScope,
  hasTaskManagementScope,
  isSuperAdminInterventionOutOfScope,
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
      projectIds: [],
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

  assert.equal(hasDepartmentManagementScope(context, "DEP-01"), true);
});

test("KAN-18: manager cannot manage another department", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: [],
    },
  });

  assert.equal(hasDepartmentManagementScope(context, "DEP-02"), false);
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

test("KAN-18: project manager can manage assigned project", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: [],
      teamIds: [],
      projectIds: ["PRJ-01"],
    },
  });

  assert.equal(
    hasProjectManagementScope(context, {
      id: "PRJ-01",
      departmentId: "DEP-01",
    }),
    true,
  );
});

test("KAN-18: department manager can manage project within department", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: [],
      projectIds: [],
    },
  });

  assert.equal(
    hasProjectManagementScope(context, {
      id: "PRJ-02",
      departmentId: "DEP-01",
    }),
    true,
  );
});

test("KAN-18: manager cannot manage project in another department", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: [],
      projectIds: ["PRJ-01"],
    },
  });

  assert.equal(
    hasProjectManagementScope(context, {
      id: "PRJ-02",
      departmentId: "DEP-02",
    }),
    false,
  );
});

test("KAN-18: team manager can manage employees in their team", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: [],
      teamIds: ["TEAM-01"],
    },
  });

  assert.equal(
    hasEmployeeManagementScope(context, {
      id: "EMP-01",
      teamId: "TEAM-01",
      departmentId: "DEP-01",
    }),
    true,
  );
});

test("KAN-18: department manager can manage employees in department teams", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: [],
    },
  });

  assert.equal(
    hasEmployeeManagementScope(context, {
      id: "EMP-02",
      teamId: "TEAM-02",
      departmentId: "DEP-01",
    }),
    true,
  );
});

test("KAN-18: manager cannot manage employee in another team", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: [],
      teamIds: ["TEAM-01"],
    },
  });

  assert.equal(
    hasEmployeeManagementScope(context, {
      id: "EMP-03",
      teamId: "TEAM-02",
      departmentId: "DEP-01",
    }),
    false,
  );
});

test("KAN-18: task management scope for team task", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: [],
      teamIds: ["TEAM-01"],
    },
  });

  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-01",
      departmentId: "DEP-01",
      teamId: "TEAM-01",
    }),
    true,
  );

  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-02",
      departmentId: "DEP-01",
      teamId: "TEAM-02",
    }),
    false,
  );
});

test("KAN-18: task management scope for project task", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: [],
      teamIds: [],
      projectIds: ["PRJ-01"],
    },
  });

  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-03",
      departmentId: "DEP-01",
      projectId: "PRJ-01",
    }),
    true,
  );

  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-04",
      departmentId: "DEP-01",
      projectId: "PRJ-02",
    }),
    false,
  );
});

test("KAN-18: department manager has scope over all tasks in department", () => {
  const context = makeContext({
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: [],
    },
  });

  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-01",
      departmentId: "DEP-01",
      teamId: "TEAM-99",
    }),
    true,
  );

  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-02",
      departmentId: "DEP-01",
      projectId: "PRJ-99",
    }),
    true,
  );

  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-03",
      departmentId: "DEP-02",
      teamId: "TEAM-01",
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
      projectIds: ["PRJ-01"],
    },
  });

  assert.equal(hasDepartmentManagementScope(context, "DEP-01"), false);

  assert.equal(
    hasTeamManagementScope(context, {
      id: "TEAM-01",
      departmentId: "DEP-01",
    }),
    false,
  );

  assert.equal(
    hasProjectManagementScope(context, {
      id: "PRJ-01",
      departmentId: "DEP-01",
    }),
    false,
  );

  assert.equal(
    hasEmployeeManagementScope(context, {
      id: "EMP-01",
      teamId: "TEAM-01",
      departmentId: "DEP-01",
    }),
    false,
  );

  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-01",
      departmentId: "DEP-01",
      teamId: "TEAM-01",
    }),
    false,
  );
});

test("KAN-18: super admin can manage all valid scopes", () => {
  const context = makeContext({
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
  });

  assert.equal(hasDepartmentManagementScope(context, "DEP-99"), true);

  assert.equal(
    hasTeamManagementScope(context, {
      id: "TEAM-99",
      departmentId: "DEP-99",
    }),
    true,
  );

  assert.equal(
    hasProjectManagementScope(context, {
      id: "PRJ-99",
      departmentId: "DEP-99",
    }),
    true,
  );

  assert.equal(
    hasEmployeeManagementScope(context, {
      id: "EMP-99",
      teamId: "TEAM-99",
      departmentId: "DEP-99",
    }),
    true,
  );

  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-99",
      departmentId: "DEP-99",
      teamId: "TEAM-99",
    }),
    true,
  );
});

test("KAN-18: detect super admin out-of-scope intervention for audit logs", () => {
  const superAdminWithTeamScope = makeContext({
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
    managementScope: {
      departmentIds: [],
      teamIds: ["TEAM-01"],
      projectIds: [],
    },
  });

  // Operating inside direct scope: not out-of-scope
  const inScopeIntervention = isSuperAdminInterventionOutOfScope(
    superAdminWithTeamScope,
    () => superAdminWithTeamScope.managementScope.teamIds.includes("TEAM-01"),
  );
  assert.equal(inScopeIntervention, false);

  // Operating outside direct scope (e.g. TEAM-99): out-of-scope (must audit)
  const outOfScopeIntervention = isSuperAdminInterventionOutOfScope(
    superAdminWithTeamScope,
    () => superAdminWithTeamScope.managementScope.teamIds.includes("TEAM-99"),
  );
  assert.equal(outOfScopeIntervention, true);

  // Normal manager is never considered a super admin intervention
  const normalManager = makeContext({
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
  });
  assert.equal(
    isSuperAdminInterventionOutOfScope(normalManager, () => false),
    false,
  );
});

test("KAN-18: empty and invalid resource identifiers are rejected", () => {
  const context = makeContext({
    isSuperAdmin: true,
  });

  assert.equal(hasDepartmentManagementScope(context, ""), false);

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
      departmentId: "  ",
    }),
    false,
  );

  assert.equal(
    hasProjectManagementScope(context, {
      id: "",
      departmentId: "DEP-01",
    }),
    false,
  );

  assert.equal(
    hasProjectManagementScope(context, {
      id: "PRJ-01",
      departmentId: "",
    }),
    false,
  );

  assert.equal(
    hasEmployeeManagementScope(context, {
      id: "",
      teamId: "TEAM-01",
      departmentId: "DEP-01",
    }),
    false,
  );

  assert.equal(
    hasTaskManagementScope(context, {
      id: "",
      departmentId: "DEP-01",
      teamId: "TEAM-01",
    }),
    false,
  );

  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-01",
      departmentId: "",
      teamId: "TEAM-01",
    }),
    false,
  );

  // Task with neither teamId nor projectId is rejected
  assert.equal(
    hasTaskManagementScope(context, {
      id: "TASK-01",
      departmentId: "DEP-01",
    }),
    false,
  );
});
