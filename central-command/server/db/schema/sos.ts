import { pgTable, uuid, text, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lgas } from './lgas';

export const sosSignals = pgTable('sos_signals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  lgaId: uuid('lga_id').notNull().references(() => lgas.id),
  location: text('location'),
  status: text('status', {
    enum: ['active', 'responding', 'resolved'],
  }).notNull().default('active'),
  respondedBy: uuid('responded_by'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  respondedByFk: foreignKey({ columns: [table.respondedBy], foreignColumns: [users.id] }),
}));

export type SosSignal = typeof sosSignals.$inferSelect;
export type NewSosSignal = typeof sosSignals.$inferInsert;
