import { pgTable, uuid, text, timestamp, boolean, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lgas, wards } from './lgas';

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),
  severity: text('severity', {
    enum: ['critical', 'high', 'medium', 'low'],
  }).notNull().default('medium'),
  title: text('title').notNull(),
  description: text('description'),
  lgaId: uuid('lga_id').notNull().references(() => lgas.id),
  wardId: uuid('ward_id'),
  location: text('location'),
  reportedBy: uuid('reported_by').notNull().references(() => users.id),
  assignedTo: uuid('assigned_to'),
  status: text('status', {
    enum: ['active', 'investigating', 'resolved', 'false_alarm'],
  }).notNull().default('active'),
  isPublic: boolean('is_public').default(false).notNull(),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: uuid('resolved_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  wardFk: foreignKey({ columns: [table.wardId], foreignColumns: [wards.id] }),
  assignedFk: foreignKey({ columns: [table.assignedTo], foreignColumns: [users.id] }),
  resolvedByFk: foreignKey({ columns: [table.resolvedBy], foreignColumns: [users.id] }),
}));

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
