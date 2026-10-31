import assert from "node:assert/strict";
import test from "node:test";
import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import {
  SYSTEM_ROLES,
  ADMIN_PERMISSIONS,
  type AccessContext,
} from "../roles.types.js";
import { RolesGuard, ROLES_KEY } from "./roles.guard.js";
import { PermissionsGuard, PERMISSIONS_KEY } from "./permissions.guard.js";

function createMockExecutionContext(
  accessContext?: AccessContext,
): ExecutionContext {
  const handler = () => {};
  const klass = class TestController {};

  return {
    getHandler: () => handler,
    getClass: () => klass,
    switchToHttp: () => ({
      getRequest: () => ({ accessContext }),
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

test("KAN-31: RolesGuard allows request when no roles required", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);
  const context = createMockExecutionContext();

  assert.equal(guard.canActivate(context), true);
});

test("KAN-31: RolesGuard allows user with required role", () => {
  const reflector = new Reflector();
  reflector.getAllAndOverride = ((key: string) => {
    if (key === ROLES_KEY) return [SYSTEM_ROLES.MANAGER];
    return undefined;
  }) as typeof reflector.getAllAndOverride;

  const guard = new RolesGuard(reflector);
  const context = createMockExecutionContext({
    userId: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
    adminPermissions: [],
  });

  assert.equal(guard.canActivate(context), true);
});

test("KAN-31: RolesGuard denies user with insufficient role", () => {
  const reflector = new Reflector();
  reflector.getAllAndOverride = ((key: string) => {
    if (key === ROLES_KEY) return [SYSTEM_ROLES.MANAGER];
    return undefined;
  }) as typeof reflector.getAllAndOverride;

  const guard = new RolesGuard(reflector);
  const context = createMockExecutionContext({
    userId: "emp-01",
    role: SYSTEM_ROLES.EMPLOYEE,
    isSuperAdmin: false,
    adminPermissions: [],
  });

  assert.equal(guard.canActivate(context), false);
});

test("KAN-31: PermissionsGuard allows manager with explicit permission", () => {
  const reflector = new Reflector();
  reflector.getAllAndOverride = ((key: string) => {
    if (key === PERMISSIONS_KEY) return [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS];
    return undefined;
  }) as typeof reflector.getAllAndOverride;

  const guard = new PermissionsGuard(reflector);
  const context = createMockExecutionContext({
    userId: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
  });

  assert.equal(guard.canActivate(context), true);
});

test("KAN-31: PermissionsGuard denies manager missing required permission", () => {
  const reflector = new Reflector();
  reflector.getAllAndOverride = ((key: string) => {
    if (key === PERMISSIONS_KEY) return [ADMIN_PERMISSIONS.MANAGE_ROLES];
    return undefined;
  }) as typeof reflector.getAllAndOverride;

  const guard = new PermissionsGuard(reflector);
  const context = createMockExecutionContext({
    userId: "mgr-01",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: false,
    adminPermissions: [ADMIN_PERMISSIONS.MANAGE_ACCOUNTS],
  });

  assert.equal(guard.canActivate(context), false);
});

test("KAN-31: PermissionsGuard allows Super Admin across all admin permissions", () => {
  const reflector = new Reflector();
  reflector.getAllAndOverride = ((key: string) => {
    if (key === PERMISSIONS_KEY) return [ADMIN_PERMISSIONS.MANAGE_ROLES];
    return undefined;
  }) as typeof reflector.getAllAndOverride;

  const guard = new PermissionsGuard(reflector);
  const context = createMockExecutionContext({
    userId: "super-01",
    role: SYSTEM_ROLES.MANAGER,
    isSuperAdmin: true,
    adminPermissions: [],
  });

  assert.equal(guard.canActivate(context), true);
});
