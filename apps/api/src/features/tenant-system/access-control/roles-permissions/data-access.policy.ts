import { SYSTEM_ROLES, type AccessContext } from "./roles.types.js";
import {
  hasTeamManagementScope,
  type ScopedAccessContext,
} from "./access-scope.types.js";

/**
 * KAN-31: Data Access & Operation Authorization Policies
 *
 * BR-PER-04: Managers only operate within assigned scope.
 * BR-PER-05 & BR-LV-05: Direct managers approve/reject employee leaves;
 * no user can approve their own leave request.
 * BR-PER-12: Reject unauthorized actions without modifying data.
 * BR-PER-14: Employees viewing colleagues' work status cannot view
 * check-in time, check-out time, or leave reason.
 * NFR-SEC-02: Employees only access their own personal info and tasks.
 */

export interface ColleagueAttendanceRecord {
  employeeId: string;
  workingStatus: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  leaveReason?: string | null;
}

export interface SanitizedAttendanceView {
  employeeId: string;
  workingStatus: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  leaveReason?: string | null;
}

/**
 * BR-PER-14 & AC-PER-10:
 * When an Employee views a colleague's attendance, check-in/out times
 * and leave reasons are redacted.
 * A Manager or the record owner can view full details.
 */
export function sanitizeAttendanceView(
  viewerContext: AccessContext,
  record: ColleagueAttendanceRecord,
): SanitizedAttendanceView {
  const isOwner = viewerContext.userId === record.employeeId;
  const isManagerOrAdmin = viewerContext.role === SYSTEM_ROLES.MANAGER;

  if (isOwner || isManagerOrAdmin) {
    return { ...record };
  }

  // Employee viewing colleague: redact sensitive fields
  return {
    employeeId: record.employeeId,
    workingStatus: record.workingStatus,
    checkInTime: null,
    checkOutTime: null,
    leaveReason: null,
  };
}

export interface LeaveApprovalRequest {
  reviewerContext: ScopedAccessContext;
  applicantId: string;
  applicantTeamId: string;
  applicantDepartmentId: string;
}

export type LeaveApprovalDecision =
  { allowed: true } | { allowed: false; reason: string };

/**
 * BR-PER-05 & BR-LV-05:
 * Only direct manager can approve/reject leave.
 * No user can approve their own leave.
 */
export function canApproveLeaveRequest(
  request: LeaveApprovalRequest,
): LeaveApprovalDecision {
  const {
    reviewerContext,
    applicantId,
    applicantTeamId,
    applicantDepartmentId,
  } = request;

  if (!reviewerContext || !reviewerContext.userId?.trim()) {
    return {
      allowed: false,
      reason: "Missing or invalid reviewer context",
    };
  }

  // BR-LV-05: Cannot approve own leave
  if (reviewerContext.userId === applicantId) {
    return {
      allowed: false,
      reason: "Users cannot approve their own leave requests (BR-LV-05)",
    };
  }

  // Must be a manager
  if (reviewerContext.role !== SYSTEM_ROLES.MANAGER) {
    return {
      allowed: false,
      reason: "Only managers can approve leave requests",
    };
  }

  // Super Admin bypass
  if (reviewerContext.isSuperAdmin) {
    return { allowed: true };
  }

  // Must have management scope over applicant's team
  const hasScope = hasTeamManagementScope(reviewerContext, {
    id: applicantTeamId,
    departmentId: applicantDepartmentId,
  });

  if (!hasScope) {
    return {
      allowed: false,
      reason: "Reviewer is not a direct manager of the applicant (BR-PER-05)",
    };
  }

  return { allowed: true };
}
