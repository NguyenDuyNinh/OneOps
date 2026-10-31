import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import { RequirePermission } from "../../../core/auth/actor-context.js";
import { SchemaPipe } from "../../../core/pipes/validation.pipe.js";
import { CHECKLOG_FEATURE, ChecklogService } from "./checklog.service.js";
import { listQuerySchema, type ListQuery } from "./dto/checklog.dto.js";

/** Read-only surface: entries are written by producers through the audit port. */
@Controller("checklog")
export class ChecklogController {
  constructor(private readonly service: ChecklogService) {}

  @Get()
  @RequirePermission(CHECKLOG_FEATURE, "view")
  list(@Query(new SchemaPipe(listQuerySchema)) query: ListQuery) {
    return this.service.list(query);
  }

  @Get("facets")
  @RequirePermission(CHECKLOG_FEATURE, "view")
  facets() {
    return this.service.facets();
  }

  @Get(":id")
  @RequirePermission(CHECKLOG_FEATURE, "view")
  get(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.get(id);
  }
}
