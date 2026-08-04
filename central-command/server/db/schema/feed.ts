import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

export const feedAcknowledgements = pgTable('feed_acknowledgements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resourceType: text('resource_type').notNull(),
  resourceId: uuid('resource_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserResource: uniqueIndex('feed_acks_user_resource_unique').on(table.userId, table.resourceType, table.resourceId),
}));

export const feedComments = pgTable('feed_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resourceType: text('resource_type').notNull(),
  resourceId: uuid('resource_id').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type FeedAcknowledgement = typeof feedAcknowledgements.$inferSelect;
export type NewFeedAcknowledgement = typeof feedAcknowledgements.$inferInsert;
export type FeedComment = typeof feedComments.$inferSelect;
export type NewFeedComment = typeof feedComments.$inferInsert;
