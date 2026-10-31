import { Module, type DynamicModule, type Type } from "@nestjs/common";
import { DatabaseModule } from "../../../../core/database/database.module.js";
import { AcceptanceController } from "./acceptance.controller.js";
import { MilestonesQaController } from "./milestones-qa.controller.js";
import { MilestonesQaRepository } from "./milestones-qa.repository.js";
import { MilestonesQaService } from "./milestones-qa.service.js";
import { QA_TASK_REF, type QaTaskRefPort } from "./qa-task.port.js";

/**
 * The task read model comes from the main composition, so milestones and QA
 * never import another feature and keep owning only their own tables.
 */
@Module({})
export class MilestonesQaModule {
  static forRoot(options: {
    tasks: Type<QaTaskRefPort>;
    imports?: DynamicModule["imports"];
  }): DynamicModule {
    return {
      module: MilestonesQaModule,
      imports: [DatabaseModule, ...(options.imports ?? [])],
      controllers: [MilestonesQaController, AcceptanceController],
      providers: [
        MilestonesQaRepository,
        MilestonesQaService,
        { provide: QA_TASK_REF, useClass: options.tasks },
      ],
      exports: [MilestonesQaService],
    };
  }
}
