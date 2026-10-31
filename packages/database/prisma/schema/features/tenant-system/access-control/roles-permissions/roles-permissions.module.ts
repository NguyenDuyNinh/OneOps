import { Module, type DynamicModule, type Type } from "@nestjs/common";
import { DatabaseModule } from "../../../../core/database/database.module.js";
import { PERMISSION_AUDIT, type PermissionAuditPort } from "./audit.port.js";
import { PermissionGuard } from "./permission.guard.js";
import { RolesPermissionsController } from "./roles-permissions.controller.js";
import { RolesPermissionsRepository } from "./roles-permissions.repository.js";
import { RolesPermissionsService } from "./roles-permissions.service.js";

/**
 * The audit sink is supplied by the composition (`tenant-system.module.ts`), so
 * this feature never imports `checklog` directly.
 */
@Module({})
export class RolesPermissionsModule {
  static forRoot(options?: {
    audit?: Type<PermissionAuditPort>;
    imports?: DynamicModule["imports"];
  }): DynamicModule {
    return {
      module: RolesPermissionsModule,
      imports: [DatabaseModule, ...(options?.imports ?? [])],
      controllers: [RolesPermissionsController],
      providers: [
        RolesPermissionsRepository,
        RolesPermissionsService,
        PermissionGuard,
        ...(options?.audit
          ? [{ provide: PERMISSION_AUDIT, useClass: options.audit }]
          : []),
      ],
      exports: [RolesPermissionsService, PermissionGuard],
    };
  }
}
