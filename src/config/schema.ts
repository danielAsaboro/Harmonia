// /config/schema.ts
import { z } from "zod";

export const envSchema = z.object({
  // Twitter OAuth
  TWITTER_CLIENT_ID: z.string().min(1),
  TWITTER_CLIENT_SECRET: z.string().min(1),
  TWITTER_CALLBACK_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1),

  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),

  // API Keys
  // API_KEY: z.string().min(1),

  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type EnvSchema = z.infer<typeof envSchema>;
