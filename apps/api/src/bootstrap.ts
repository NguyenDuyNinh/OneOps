import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ErrorsFilter } from "./core/filters/errors.filter.js";
export async function createApp() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === "test" ? false : ["error", "warn", "log"],
  });
  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new ErrorsFilter());
  app.enableShutdownHooks();
  return app;
}
