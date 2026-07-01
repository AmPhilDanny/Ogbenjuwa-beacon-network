import { pgTable, uuid, text, numeric, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { lgas } from './lgas';

export const villages = pgTable('villages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  lgaId: uuid('lga_id').notNull().references(() => lgas.id),
  wardId: uuid('ward_id'),
  lat: numeric('lat'),
  lng: numeric('lng'),
  population: integer('population').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Village = typeof villages.$inferSelect;
export type NewVillage = typeof villages.$inferInsert;
