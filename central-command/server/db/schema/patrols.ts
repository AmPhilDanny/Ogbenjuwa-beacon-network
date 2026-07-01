import { pgTable, uuid, text, integer, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lgas } from './lgas';

export const patrolTeams = pgTable('patrol_teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  lgaId: uuid('lga_id').notNull().references(() => lgas.id),
  wardId: uuid('ward_id'),
  leaderId: uuid('leader_id').notNull().references(() => users.id),
  memberCount: integer('member_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const patrolMembers = pgTable('patrol_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => patrolTeams.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

export const patrolShifts = pgTable('patrol_shifts', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull().references(() => patrolTeams.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  status: text('status', {
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
  }).notNull().default('scheduled'),
  notes: text('notes'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const patrolCheckins = pgTable('patrol_checkins', {
  id: uuid('id').primaryKey().defaultRandom(),
  shiftId: uuid('shift_id').notNull().references(() => patrolShifts.id, { onDelete: 'cascade' }),
  memberId: uuid('member_id').notNull().references(() => users.id),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  lat: numeric('lat'),
  lng: numeric('lng'),
  note: text('note'),
});

export type PatrolTeam = typeof patrolTeams.$inferSelect;
export type NewPatrolTeam = typeof patrolTeams.$inferInsert;
export type PatrolMember = typeof patrolMembers.$inferSelect;
export type NewPatrolMember = typeof patrolMembers.$inferInsert;
export type PatrolShift = typeof patrolShifts.$inferSelect;
export type NewPatrolShift = typeof patrolShifts.$inferInsert;
export type PatrolCheckin = typeof patrolCheckins.$inferSelect;
export type NewPatrolCheckin = typeof patrolCheckins.$inferInsert;
