// lead-workflow/apps/api/src/config/env.schema.ts

import { z } from "zod";

export const envSchema = z.object({
  // ========================================
  // APP
  // ========================================
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  API_PORT: z.coerce.number().int().positive().default(3000),

  // ========================================
  // DATABASE
  // ========================================
  DATABASE_URL: z.string().url(),
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string().default("lead_workflow"),

  // ========================================
  // REDIS
  // ========================================
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // ========================================
  // AUTH
  // ========================================
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),

  // ========================================
  // AI PROVIDER
  // ========================================
  AI_PROVIDER: z.enum(["openai", "anthropic", "gemini", "groq"]).optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
});

export type EnvConfig = z.infer<typeof envSchema>;
