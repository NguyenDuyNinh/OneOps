import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Sse,
} from "@nestjs/common";
import { z } from "zod";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  listQuery,
  readAllSchema,
  streamQuery,
} from "./dto/notifications.dto.js";
import { NotificationsService } from "./notifications.service.js";
import { NotificationStream } from "./notification-stream.js";

@Controller("notifications")
export class NotificationsController {
  constructor(
    private readonly service: NotificationsService,
    private readonly stream: NotificationStream,
  ) {}

  @Get() list(
    @Query(new SchemaPipe(listQuery)) query: z.infer<typeof listQuery>,
  ) {
    return this.service.list(query);
  }

  @Sse("stream") events(
    @Query(new SchemaPipe(streamQuery)) query: z.infer<typeof streamQuery>,
  ) {
    return this.stream.stream(query.recipient);
  }

  @Get(":id") get(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.get(id);
  }

  @Patch("read-all") readAll(
    @Body(new SchemaPipe(readAllSchema)) input: z.infer<typeof readAllSchema>,
  ) {
    return this.service.markAllRead(input.recipient);
  }

  @Patch(":id/read") read(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.markRead(id);
  }

  @Delete(":id") remove(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.service.remove(id);
  }
}
