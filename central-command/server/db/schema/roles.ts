import { pgTable, uuid, text, boolean, timestamp, jsonb, unique } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  label: text('label').notNull(),
  description: text('description'),
  permissionKeys: jsonb('permission_keys').$type<string[]>().notNull().default([]),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameUnique: unique('roles_name_unique').on(table.name),
}));

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;