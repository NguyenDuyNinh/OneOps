import assert from "node:assert/strict";
import test from "node:test";

import { SYSTEM_ROLES, type AccessContext } from "./roles.types.js";
import type { ScopedAccessContext } from "./access-scope.types.js";
import {
  sanitizeAttendanceView,
  canApproveLeaveRequest,
  type ColleagueAttendanceRecord,
} from "./data-access.policy.js";

const sampleRecord: ColleagueAttendanceRecord = {
  employeeId: "emp-colleague",
  workingStatus: "At Office",
  checkInTime: "08:02:15",
  checkOutTime: "17:35:00",
  leaveReason: "Family event",
};

test("KAN-31: employee viewing colleague has check-in times and leave reasons redacted (BR-PER-14, AC-PER-10)", () => {
  const employeeViewer: AccessContext = {
    userId: "emp-viewer",
    role: SYSTEM_ROLES.EMPLOYEE,
    isSuperAdmin: false,
    adminPermissions: [],
  };

  const viewed = sanitizeAttendanceView(employeeViewer, sampleRecord);

  assert.equal(viewed.employeeId, "emp-colleague");
  assert.equal(viewed.workingStatus, "At Office");
  assert.equal(viewed.checkInTime, null);
  assert.equal(viewed.checkOutTime, null);
  assert.equal(viewed.leaveReason, null);
});

test("KAN-31: employee viewing own record can see all details", () => {
  const selfViewer: AccessContext = {
    userId: "emp-colleague",
    role: SYSTEM_ROLES.EMPLOYEE,
    isSuperAdmin: false,
    adminPermissions: [],
  };

  const viewed = sanitizeAttendanceView(selfViewer, sampleRecord);

  assert.equal(viewed.checkInTime, "08:02:15");
  assert.equal(viewed.leaveReason, "Family event");
});

test("KAN-31: manager can view full details of colleague record", () => {
  const managerViewer: AccessContext = {
    userId: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
    adminPermissions: [],
  };

  const viewed = sanitizeAttendanceView(managerViewer, sampleRecord);

  assert.equal(viewed.checkInTime, "08:02:15");
  assert.equal(viewed.leaveReason, "Family event");
});

test("KAN-31: direct manager can approve employee leave (BR-PER-05)", () => {
  const managerContext: ScopedAccessContext = {
    userId: "mgr-team-lead",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
    adminPermissions: [],
    managementScope: {
      departmentIds: [],
      teamIds: ["TEAM-01"],
    },
  };

  const decision = canApproveLeaveRequest({
    reviewerContext: managerContext,
    applicantId: "emp-01",
    applicantTeamId: "TEAM-01",
    applicantDepartmentId: "DEP-01",
  });

  assert.equal(decision.allowed, true);
});

test("KAN-31: cannot approve own leave request (BR-LV-05, AC-PER-08)", () => {
  const managerContext: ScopedAccessContext = {
    userId: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
    adminPermissions: [],
    managementScope: {
      departmentIds: ["DEP-01"],
      teamIds: ["TEAM-01"],
    },
  };

  const decision = canApproveLeaveRequest({
    reviewerContext: managerContext,
    applicantId: "mgr-01",
    applicantTeamId: "TEAM-01",
    applicantDepartmentId: "DEP-01",
  });

  assert.equal(decision.allowed, false);
  if (!decision.allowed) {
    assert.match(decision.reason, /cannot approve their own/);
  }
});

test("KAN-31: manager outside scope cannot approve employee leave", () => {
  const managerContext: ScopedAccessContext = {
    userId: "mgr-other",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
    adminPermissions: [],
    managementScope: {
      departmentIds: [],
      teamIds: ["TEAM-02"],
    },
  };

  const decision = canApproveLeaveRequest({
    reviewerContext: managerContext,
    applicantId: "emp-01",
    applicantTeamId: "TEAM-01",
    applicantDepartmentId: "DEP-01",
  });

  assert.equal(decision.allowed, false);
});
