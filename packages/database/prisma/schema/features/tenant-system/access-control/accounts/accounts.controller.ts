import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
} from "@nestjs/common";
import { z } from "zod";
import {
  changeAccessSchema,
  createAccountSchema,
  listQuery,
  resetPasswordSchema,
  updateAccountSchema,
} from "./dto/accounts.dto.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  AdminOnly,
  CurrentActor,
  Public,
  type ActorContext,
} from "../../../../core/auth/actor-context.js";
import { AccountsService } from "./accounts.service.js";
@Controller("accounts")
export class AccountsController {
  constructor(private readonly service: AccountsService) {}
  @Get() list(
    @Query(new SchemaPipe(listQuery)) query: z.infer<typeof listQuery>,
  ) {
    return this.service.list(query);
  }
  // Reachable without a session only while the tenant has no account yet; the
  // service rejects every other anonymous call.
  @Public()
  @Post()
  create(
    @Body(new SchemaPipe(createAccountSchema))
    input: z.infer<typeof createAccountSchema>,
    @CurrentActor() actor?: ActorContext,
  ) {
    return this.service.create(input, actor);
  }
  @Get(":id") get(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.get(id);
  }
  @Patch(":id")
  @AdminOnly()
  update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(updateAccountSchema))
    input: z.infer<typeof updateAccountSchema>,
  ) {
    return this.service.update(id, input);
  }
  @Get(":id/history") history(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.history(id);
  }
  @Post(":id/access")
  @HttpCode(200)
  @AdminOnly()
  changeAccess(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(changeAccessSchema))
    input: z.infer<typeof changeAccessSchema>,
    @CurrentActor() actor?: ActorContext,
  ) {
    return this.service.changeAccess(id, input, actor);
  }
  @Post(":id/password")
  @HttpCode(200)
  @AdminOnly()
  resetPassword(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new SchemaPipe(resetPasswordSchema))
    input: z.infer<typeof resetPasswordSchema>,
    @CurrentActor() actor?: ActorContext,
  ) {
    return this.service.resetPassword(id, input, actor);
  }
}
