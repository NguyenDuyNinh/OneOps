import { Module } from "@nestjs/common";
import { EmployeeDirectoryModule } from "./employees/employee-directory/index.js";
import { DepartmentsTeamsModule } from "./organization/departments-teams/index.js";
import { PositionsGradesModule } from "./organization/positions-grades/index.js";

@Module({
  imports: [
    DepartmentsTeamsModule,
    PositionsGradesModule,
    EmployeeDirectoryModule,
  ],
})
export class HrManagementModule {}
