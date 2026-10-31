import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { z } from "zod";
import {
  CurrentActor,
  RequirePermission,
  type ActorContext,
} from "../../../../core/auth/actor-context.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  adjustmentInput,
  decisionInput,
  entryInput,
  entryPatch,
  openPeriodSchema,
  periodListQuery,
  versionSchema,
} from "./dto/timesheets.dto.js";
import { TimesheetsService } from "./timesheets.service.js";

const FEATURE = "work-management/projects/timesheets";

@Controller("timesheets")
export class TimesheetsController {
  constructor(private readonly service: TimesheetsService) {}

  @Get("rules")
  @RequirePermission(FEATURE, "view")
  rules() {
    return this.service.rules();
  }

  @Get("periods")
  @RequirePermission(FEATURE, "view")
  list(
    @Query(new SchemaPipe(periodListQuery))
    query: z.infer<typeof periodListQuery>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.list(query, actor);
  }

  @Post("periods")
  open(
    @Body(new SchemaPipe(openPeriodSchema))
    input: z.infer<typeof openPeriodSchema>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.open(input.weekStart, actor);
  }

  @Get("periods/:id")
  @RequirePermission(FEATURE, "view")
  get(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.get(id, actor);
  }

  @Post("periods/:id/entries")
  addEntry(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(entryInput)) input: z.infer<typeof entryInput>,
    @CurrentActor() actor: ActorContext,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.service.addEntry(id, input, actor, this.requestKey(key));
  }

  @Patch("periods/:id/entries/:entryId")
  updateEntry(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Param("entryId", new ParseUUIDPipe()) entryId: string,
    @Body(new SchemaPipe(entryPatch)) input: z.infer<typeof entryPatch>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.updateEntry(id, entryId, input, actor);
  }

  @Delete("periods/:id/entries/:entryId")
  removeEntry(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Param("entryId", new ParseUUIDPipe()) entryId: string,
    @Body(new SchemaPipe(versionSchema)) input: z.infer<typeof versionSchema>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.removeEntry(id, entryId, input.version, actor);
  }

  @Post("periods/:id/submit")
  @HttpCode(200)
  submit(
    @Param("id", new ParseUUIDPipe()) id: string,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.submit(id, actor);
  }

  @Post("periods/:id/decision")
  @HttpCode(200)
  decide(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(decisionInput)) input: z.infer<typeof decisionInput>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.decide(id, input, actor);
  }

  @Post("entries/:entryId/adjustments")
  adjust(
    @Param("entryId", new ParseUUIDPipe()) entryId: string,
    @Body(new SchemaPipe(adjustmentInput))
    input: z.infer<typeof adjustmentInput>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.adjust(entryId, input, actor);
  }

  /** Entry creation is the only repeatable write; the key makes retries harmless. */
  private requestKey(raw?: string) {
    const value = raw?.trim();
    if (!value) return null;
    if (value.length < 8 || value.length > 120)
      throw new BadRequestException("Idempotency-Key không hợp lệ.");
    return value;
  }
}
