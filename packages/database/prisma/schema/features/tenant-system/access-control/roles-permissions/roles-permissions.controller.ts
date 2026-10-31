import { Body, Controller, Get, HttpCode, Put } from "@nestjs/common";
import { z } from "zod";
import {
  AdminOnly,
  CurrentActor,
  RequirePermission,
  type ActorContext,
} from "../../../../core/auth/actor-context.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import { SELF_FEATURE } from "./permission-catalog.js";
import { saveMatrixSchema } from "./dto/roles-permissions.dto.js";
import { RolesPermissionsService } from "./roles-permissions.service.js";

@Controller("permissions")
export class RolesPermissionsController {
  constructor(private readonly service: RolesPermissionsService) {}

  @Get()
  @RequirePermission(SELF_FEATURE, "view")
  list() {
    return this.service.matrix();
  }

  /** Session-only probe so the UI can hide actions before asking for the matrix. */
  @Get("me")
  mine(@CurrentActor() actor: ActorContext) {
    return this.service.mine(actor);
  }

  @Get("history")
  @RequirePermission(SELF_FEATURE, "view")
  history() {
    return this.service.history();
  }

  @Put()
  @HttpCode(200)
  @AdminOnly()
  @RequirePermission(SELF_FEATURE, "update")
  save(
    @Body(new SchemaPipe(saveMatrixSchema))
    input: z.infer<typeof saveMatrixSchema>,
    @CurrentActor() actor: ActorContext,
  ) {
    return this.service.save(input, actor);
  }
}
