import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from backend root if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CLIENT_URL: z.string().min(1, 'CLIENT_URL is required').default('http://localhost:5173'),
  APP_TIMEZONE: z.string().default('Asia/Dhaka'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('hostpilot-super-secret-dev-jwt-key-2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('hostpilot-cookie-secret-key-2026'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(customEnv?: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(customEnv || process.env);

  if (!result.success) {
    const errorDetails = result.error.errors.map((e) => `[${e.path.join('.')}]: ${e.message}`).join(', ');
    throw new Error(`Environment validation failed: ${errorDetails}`);
  }

  return result.data;
}

export const env = validateEnv();
