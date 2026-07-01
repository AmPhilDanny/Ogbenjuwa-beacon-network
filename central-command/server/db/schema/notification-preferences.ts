import { pgTable, uuid, text, boolean, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  smsAlerts: boolean('sms_alerts').default(true).notNull(),
  pushAlerts: boolean('push_alerts').default(true).notNull(),
  emailAlerts: boolean('email_alerts').default(false).notNull(),
  criticalOnly: boolean('critical_only').default(false).notNull(),
  quietHoursStart: text('quiet_hours_start'),
  quietHoursEnd: text('quiet_hours_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
