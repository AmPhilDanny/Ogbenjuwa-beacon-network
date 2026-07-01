import { pgTable, uuid, text, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { alerts } from './alerts';

export const smsLogs = pgTable('sms_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertId: uuid('alert_id'),
  recipientPhone: text('recipient_phone').notNull(),
  recipientName: text('recipient_name'),
  message: text('message').notNull(),
  status: text('status', {
    enum: ['sent', 'delivered', 'failed'],
  }).notNull().default('sent'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  deliveredAt: timestamp('delivered_at'),
}, (table) => ({
  alertFk: foreignKey({ columns: [table.alertId], foreignColumns: [alerts.id] }),
}));

export type SmsLog = typeof smsLogs.$inferSelect;
export type NewSmsLog = typeof smsLogs.$inferInsert;
