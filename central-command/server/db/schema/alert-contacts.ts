import { pgTable, uuid, text, boolean, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lgas } from './lgas';

export const alertContacts = pgTable('alert_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  village: text('village'),
  lgaId: uuid('lga_id').notNull().references(() => lgas.id),
  wardId: uuid('ward_id'),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AlertContact = typeof alertContacts.$inferSelect;
export type NewAlertContact = typeof alertContacts.$inferInsert;
