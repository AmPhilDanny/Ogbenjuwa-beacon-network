import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const alertTypes = pgTable('alert_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').unique().notNull(),
  label: text('label').notNull(),
  labelIdoma: text('label_idoma'),
  icon: text('icon').default('⚠️'),
  color: text('color').default('#6B7280'),
  smsTemplate: text('sms_template'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AlertType = typeof alertTypes.$inferSelect;
export type NewAlertType = typeof alertTypes.$inferInsert;
