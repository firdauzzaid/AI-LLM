// lead-workflow/apps/api/src/main.ts

import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { Logger, ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import type { EnvConfig } from "./config/env.schema";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  const configService = app.get(ConfigService<EnvConfig, true>);
  const port = configService.get("API_PORT", { infer: true });
  const nodeEnv = configService.get("NODE_ENV", { infer: true });

  // Global validation pipe (untuk DTO non-Zod nanti kalau ada)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS (nanti kita tighten ketika frontend ready)
  app.enableCors({
    origin: nodeEnv === "development" ? true : false,
    credentials: true,
  });

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);

  const logger = new Logger("Bootstrap");
  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`Environment: ${nodeEnv}`);
}

bootstrap().catch((error) => {
  const logger = new Logger("Bootstrap");
  logger.error("Failed to start application", error);
  process.exit(1);
});
