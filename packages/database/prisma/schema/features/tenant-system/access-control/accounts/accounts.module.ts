import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../../core/database/database.module.js";
import { AccountsController } from "./accounts.controller.js";
import { AccountsRepository } from "./accounts.repository.js";
import { AccountsService } from "./accounts.service.js";

@Module({
  imports: [DatabaseModule],
  controllers: [AccountsController],
  providers: [AccountsRepository, AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
