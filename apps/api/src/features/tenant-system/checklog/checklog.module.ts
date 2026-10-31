import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../core/database/database.module.js";
import { ChecklogController } from "./checklog.controller.js";
import { ChecklogRepository } from "./checklog.repository.js";
import { ChecklogService } from "./checklog.service.js";

/**
 * Exports the sink so the composition can bind it to a producer port; the
 * feature itself never imports the producers.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [ChecklogController],
  providers: [ChecklogRepository, ChecklogService],
  exports: [ChecklogService],
})
export class ChecklogModule {}
