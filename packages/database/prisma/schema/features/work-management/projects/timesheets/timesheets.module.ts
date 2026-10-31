import { Module, type DynamicModule, type Type } from "@nestjs/common";
import { DatabaseModule } from "../../../../core/database/database.module.js";
import {
  TimesheetTaskRefPort,
  TIMESHEET_TASK_REF,
} from "./timesheet-task.port.js";
import { TimesheetsController } from "./timesheets.controller.js";
import { TimesheetsRepository } from "./timesheets.repository.js";
import { TimesheetsService } from "./timesheets.service.js";

/** The task read model is supplied by the main composition, never imported here. */
@Module({})
export class TimesheetsModule {
  static forRoot(options: {
    tasks: Type<TimesheetTaskRefPort>;
    imports?: DynamicModule["imports"];
  }): DynamicModule {
    return {
      module: TimesheetsModule,
      imports: [DatabaseModule, ...(options.imports ?? [])],
      controllers: [TimesheetsController],
      providers: [
        TimesheetsRepository,
        TimesheetsService,
        { provide: TIMESHEET_TASK_REF, useClass: options.tasks },
      ],
      exports: [TimesheetsService],
    };
  }
}
