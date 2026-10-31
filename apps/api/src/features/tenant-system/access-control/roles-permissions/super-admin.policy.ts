import { SYSTEM_ROLES, type AccessContext } from "./roles.types.js";

/**
 * KAN-51: Super Admin Access & Out-of-Scope Intervention Policy
 *
 * BR-PER-01: Super Admin is an actor with role MANAGER and isSuperAdmin = true.
 * BR-PER-11: Any intervention by Super Admin outside their assigned management
 * scope must be flagged for auditing (actor, timestamp, resource, action).
 * BR-ORG-19: Super Admin can operate across all departments and teams without
 * boundary limitations, with out-of-scope actions recorded in audit history.
 */

export const SUPER_ADMIN_RESOURCE_TYPES = {
  DEPARTMENT: "DEPARTMENT",
  TEAM: "TEAM",
  PROJECT: "PROJECT",
  TASK: "TASK",
  ACCOUNT: "ACCOUNT",
  SYSTEM_CONFIG: "SYSTEM_CONFIG",
} as const;

export type SuperAdminResourceType =
  (typeof SUPER_ADMIN_RESOURCE_TYPES)[keyof typeof SUPER_ADMIN_RESOURCE_TYPES];

export interface SuperAdminInterventionAuditRecord {
  actorId: string;
  resourceType: SuperAdminResourceType;
  resourceId: string;
  action: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export type SuperAdminAccessDecision =
  | {
      allowed: true;
      isElevatedBypass: false;
    }
  | {
      allowed: true;
      isElevatedBypass: true;
      auditRecord: SuperAdminInterventionAuditRecord;
    }
  | {
      allowed: false;
      isElevatedBypass: false;
      reason: string;
    };

/**
 * BR-PER-01: Validates that an actor qualifies as Super Admin.
 * Super Admin MUST have role MANAGER. EMPLOYEE with isSuperAdmin is rejected.
 */
export function isValidSuperAdmin(context: AccessContext): boolean {
  if (!context || !context.userId?.trim()) {
    return false;
  }

  return context.role === SYSTEM_ROLES.MANAGER && context.isSuperAdmin === true;
}

export interface SuperAdminAccessRequest {
  context: AccessContext;
  resourceType: SuperAdminResourceType;
  resourceId: string;
  action: string;
  hasDirectAccess: () => boolean;
  details?: Record<string, unknown>;
}

/**
 * Evaluates access for any operation that can be executed by either
 * a directly authorized manager or an elevated Super Admin.
 *
 * If direct access is satisfied, access is granted without elevated bypass.
 * If direct access is not satisfied but actor is Super Admin, access is granted
 * with an audit record created according to BR-PER-11 & BR-ORG-19.
 */
export function evaluateSuperAdminAccess(
  request: SuperAdminAccessRequest,
): SuperAdminAccessDecision {
  const {
    context,
    resourceType,
    resourceId,
    action,
    hasDirectAccess,
    details,
  } = request;

  if (!context || !context.userId?.trim()) {
    return {
      allowed: false,
      isElevatedBypass: false,
      reason: "Invalid or missing actor context",
    };
  }

  if (!resourceId?.trim() || !action?.trim()) {
    return {
      allowed: false,
      isElevatedBypass: false,
      reason: "Resource ID and action must not be empty",
    };
  }

  // 1. Direct authority check (within normal assigned scope or relation)
  if (hasDirectAccess()) {
    return {
      allowed: true,
      isElevatedBypass: false,
    };
  }

  // 2. Elevated Super Admin intervention check (BR-PER-01, BR-PER-11, BR-ORG-19)
  if (isValidSuperAdmin(context)) {
    return {
      allowed: true,
      isElevatedBypass: true,
      auditRecord: {
        actorId: context.userId,
        resourceType,
        resourceId,
        action,
        timestamp: new Date().toISOString(),
        details,
      },
    };
  }

  return {
    allowed: false,
    isElevatedBypass: false,
    reason:
      "Access denied: outside assigned management scope and not super admin",
  };
}
