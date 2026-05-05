// lead-workflow/apps/api/src/config/env.config.ts

import { envSchema, EnvConfig } from "./env.schema";

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `  - ${err.path.join(".")}: ${err.message}`)
      .join("\n");

    throw new Error(
      `Invalid environment variables:\n${errors}\n\n` +
        `Please check your .env file against .env.example`,
    );
  }

  return result.data;
}

// Untuk type-safe access di service/controller
// Contoh penggunaan: const port = config.get<number>('API_PORT');
export type ConfigKey = keyof EnvConfig;
