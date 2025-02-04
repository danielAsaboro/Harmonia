// /config/env.ts
import { envSchema, type EnvSchema } from "./schema";

class EnvironmentConfig {
  private config: EnvSchema;

  constructor() {
    try {
      // Parse and validate environment variables
      this.config = envSchema.parse({
        TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
        TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
        TWITTER_CALLBACK_URL: process.env.TWITTER_CALLBACK_URL,
        DATABASE_URL: process.env.DATABASE_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        // API_KEY: process.env.API_KEY,
        NODE_ENV: process.env.NODE_ENV,
      });
    } catch (error) {
      console.error("❌ Invalid environment variables:", error);
      throw new Error("Invalid environment variables");
    }
  }

  get env(): EnvSchema {
    return this.config;
  }

  get isDevelopment(): boolean {
    return this.config.NODE_ENV === "development";
  }

  get isProduction(): boolean {
    return this.config.NODE_ENV === "production";
  }

  get isTest(): boolean {
    return this.config.NODE_ENV === "test";
  }
}

// Create a singleton instance
const env = new EnvironmentConfig();

// Freeze the config object to prevent modifications
Object.freeze(env);

export default env;
