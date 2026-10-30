import { Global, Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module.js";
import { NotificationEvents } from "./events/notification-events.js";
@Global()
@Module({
  imports: [DatabaseModule],
  providers: [NotificationEvents],
  exports: [DatabaseModule, NotificationEvents],
})
export class CoreModule {}
