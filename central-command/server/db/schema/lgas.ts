import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const lgas = pgTable('lgas', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').unique().notNull(),
  state: text('state').default('Benue').notNull(),
  region: text('region').default('Idoma').notNull(),
  coverageTarget: integer('coverage_target').default(80),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const wards = pgTable('wards', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  lgaId: uuid('lga_id').notNull().references(() => lgas.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Lga = typeof lgas.$inferSelect;
export type NewLga = typeof lgas.$inferInsert;
export type Ward = typeof wards.$inferSelect;
export type NewWard = typeof wards.$inferInsert;
