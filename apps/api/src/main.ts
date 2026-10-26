import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors({
    origin: process.env.WS_CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true, // Reject unknown properties
      transform: true,           // Auto-transform payloads to DTO instances
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`🚀 OneOps API running on http://localhost:${port}`);
}

bootstrap();
