import { Module } from "@nestjs/common";
import { CoreModule } from "./core/core.module.js";
import { TenantSystemModule } from "./features/tenant-system/index.js";
import { WorkManagementModule } from "./features/work-management/index.js";
import { HrManagementModule } from "./features/hr-management/index.js";
import { CrmModule } from "./features/crm/index.js";
@Module({
  imports: [
    CoreModule,
    TenantSystemModule,
    WorkManagementModule,
    HrManagementModule,
    CrmModule,
  ],
})
export class AppModule {}
