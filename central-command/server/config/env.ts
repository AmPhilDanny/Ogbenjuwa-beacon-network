import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// compiled output lives one dir deeper (dist/config), so .env may be 2 or 3 levels up
const envCandidates = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '.env'),
];
const envPath = envCandidates.find(p => fs.existsSync(p));
if (envPath) dotenv.config({ path: envPath });

const envSchema = z.object({
  PORT: z.coerce.number().default(4001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/ogbenjuwa_central'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('ogbenjuwa-central-command-jwt-secret-dev-only'),
  JWT_REFRESH_SECRET: z.string().default('ogbenjuwa-central-command-refresh-secret-dev-only'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:4000,http://localhost:3000,http://localhost:3001'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins = env.CORS_ORIGINS.split(',').map(s => s.trim());
