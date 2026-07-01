import { pgTable, uuid, text, jsonb, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lgas } from './lgas';

export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  requesterId: uuid('requester_id').notNull().references(() => users.id),
  targetId: uuid('target_id').notNull().references(() => users.id),
  status: text('status', {
    enum: ['pending', 'accepted', 'rejected'],
  }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const residentReports = pgTable('resident_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  lgaId: uuid('lga_id').notNull().references(() => lgas.id),
  description: text('description').notNull(),
  mediaUrls: jsonb('media_urls').default([]).notNull(),
  status: text('status', {
    enum: ['submitted', 'reviewed', 'actioned'],
  }).notNull().default('submitted'),
  reviewedBy: uuid('reviewed_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  reviewedByFk: foreignKey({ columns: [table.reviewedBy], foreignColumns: [users.id] }),
}));

export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;
export type ResidentReport = typeof residentReports.$inferSelect;
export type NewResidentReport = typeof residentReports.$inferInsert;
