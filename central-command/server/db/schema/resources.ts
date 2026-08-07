import { pgTable, uuid, text, integer, numeric, boolean, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { lgas, wards } from './lgas';
import { villages } from './villages';

export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type', {
    enum: ['medical', 'shelter', 'water', 'food'],
  }).notNull(),
  name: text('name').notNull(),
  lgaId: uuid('lga_id').notNull().references(() => lgas.id),
  wardId: uuid('ward_id'),
  villageId: uuid('village_id'),
  lat: numeric('lat'),
  lng: numeric('lng'),
  capacity: integer('capacity').default(0),
  occupied: integer('occupied').default(0),
  phone: text('phone'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  wardFk: foreignKey({ columns: [table.wardId], foreignColumns: [wards.id] }),
  villageFk: foreignKey({ columns: [table.villageId], foreignColumns: [villages.id] }),
}));

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
