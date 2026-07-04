import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from './env.js';
import * as schema from '../db/schema/index.js';

export const queryClient = postgres(env.DATABASE_URL, { 
  max: 3,
  idle_timeout: 10,
  connect_timeout: 10,
  max_lifetime: 60 * 5,
});
export const db = drizzle(queryClient, { schema });

export default db;
