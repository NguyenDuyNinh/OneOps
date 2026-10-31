import { Module } from "@nestjs/common";
import { EmployeeDirectoryController } from "./employee-directory.controller.js";
import { EmployeeDirectoryRepository } from "./employee-directory.repository.js";
import { EmployeeDirectoryService } from "./employee-directory.service.js";
@Module({
  controllers: [EmployeeDirectoryController],
  providers: [EmployeeDirectoryRepository, EmployeeDirectoryService],
  exports: [EmployeeDirectoryService],
})
export class EmployeeDirectoryModule {}
