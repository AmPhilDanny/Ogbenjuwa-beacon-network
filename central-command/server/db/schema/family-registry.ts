import { pgTable, uuid, text, integer, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lgas } from './lgas';

export const familyRegistry = pgTable('family_registry', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  age: integer('age'),
  gender: text('gender', { enum: ['M', 'F'] }),
  lgaId: uuid('lga_id').notNull().references(() => lgas.id),
  village: text('village'),
  status: text('status', {
    enum: ['at_camp', 'searching', 'reunified'],
  }).notNull().default('searching'),
  camp: text('camp'),
  notes: text('notes'),
  registeredBy: uuid('registered_by').notNull().references(() => users.id),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type FamilyEntry = typeof familyRegistry.$inferSelect;
export type NewFamilyEntry = typeof familyRegistry.$inferInsert;
