import {
  SetMetadata,
  createParamDecorator,
  type ExecutionContext,
} from "@nestjs/common";

export interface ActorContext {
  accountId: string;
  employeeId: string;
  displayName: string;
  role: "EMPLOYEE" | "MANAGER";
  isSystemAdmin: boolean;
  sessionId: string;
}

export interface ActorRequest {
  actor?: ActorContext;
  headers: { cookie?: string; "user-agent"?: string };
}

export const PUBLIC_ROUTE = "oneops:public-route";
export const ADMIN_ONLY = "oneops:admin-only";
export const REQUIRE_PERMISSION = "oneops:require-permission";

/** Actions the permission matrix can grant; `manage` stays reserved for system administrators. */
export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "update",
  "delete",
  "approve",
  "manage",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export interface PermissionRequirement {
  feature: string;
  action: PermissionAction;
}

/** Route reachable without a session; the guard still attaches an actor when a valid cookie is sent. */
export const Public = () => SetMetadata(PUBLIC_ROUTE, true);

/** Route reserved for accounts flagged `isSystemAdmin`; evaluated after the session resolves. */
export const AdminOnly = () => SetMetadata(ADMIN_ONLY, true);

/**
 * Declares the matrix cell a route needs. The permission owner evaluates it after
 * the session resolves, so a feature can protect a route without importing another
 * feature.
 */
export const RequirePermission = (feature: string, action: PermissionAction) =>
  SetMetadata(REQUIRE_PERMISSION, { feature, action });

export const CurrentActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<ActorRequest>().actor,
);
