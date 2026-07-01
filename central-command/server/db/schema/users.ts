import { pgTable, uuid, text, timestamp, boolean, foreignKey } from 'drizzle-orm/pg-core';
import { lgas } from './lgas';
import { wards } from './lgas';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  role: text('role', {
    enum: ['super_admin', 'state_observer', 'lga_coordinator', 'vigilante_leader', 'community_admin', 'resident'],
  }).notNull().default('community_admin'),
  lgaId: uuid('lga_id'),
  wardId: uuid('ward_id'),
  avatar: text('avatar'),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  lgaFk: foreignKey({ columns: [table.lgaId], foreignColumns: [lgas.id] }),
  wardFk: foreignKey({ columns: [table.wardId], foreignColumns: [wards.id] }),
}));

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text('refresh_token').notNull(),
  deviceInfo: text('device_info'),
  ipAddress: text('ip_address'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
