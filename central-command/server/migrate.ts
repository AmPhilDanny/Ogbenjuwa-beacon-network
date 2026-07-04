import postgres from 'postgres';
import { env } from './config/env.js';

/**
 * Ensures the `users` and `sessions` tables exist.
 * This runs on every server start and is idempotent (CREATE TABLE IF NOT EXISTS).
 * Only creates auth-critical tables — other tables (site_settings, lgas, etc.)
 * can be created via the full migration or seed script.
 */
export async function ensureAuthTables(sql: postgres.Sql) {
  // ── users ──────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL,
      username text,
      password_hash text NOT NULL,
      name text NOT NULL,
      phone text,
      role text NOT NULL DEFAULT 'community_admin',
      lga_id uuid,
      ward_id uuid,
      avatar text,
      is_active boolean NOT NULL DEFAULT true,
      otp_code text,
      otp_expires_at timestamp,
      last_login_at timestamp,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now(),
      CONSTRAINT users_email_unique UNIQUE (email),
      CONSTRAINT users_username_unique UNIQUE (username)
    );
  `;

  // ── sessions ────────────────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token text NOT NULL,
      device_info text,
      ip_address text,
      expires_at timestamp NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `;

  // ── indexes (idempotent via IF NOT EXISTS) ──────────────────────────
  await sql`
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `;

  console.log('  ✓ Auth tables ensured (users, sessions)');
}
