import { pgTable, uuid, text, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lgas, wards } from './lgas';
import { alerts } from './alerts';

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertId: uuid('alert_id'),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  lgaId: uuid('lga_id').notNull().references(() => lgas.id),
  wardId: uuid('ward_id'),
  location: text('location'),
  status: text('status', {
    enum: ['reported', 'investigating', 'resolved', 'closed'],
  }).notNull().default('reported'),
  priority: text('priority', {
    enum: ['critical', 'high', 'medium', 'low'],
  }).notNull().default('medium'),
  reportedBy: uuid('reported_by').notNull().references(() => users.id),
  assignedTo: uuid('assigned_to'),
  responseNotes: text('response_notes'),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: uuid('resolved_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  alertFk: foreignKey({ columns: [table.alertId], foreignColumns: [alerts.id] }),
  wardFk: foreignKey({ columns: [table.wardId], foreignColumns: [wards.id] }),
  assignedFk: foreignKey({ columns: [table.assignedTo], foreignColumns: [users.id] }),
  resolvedByFk: foreignKey({ columns: [table.resolvedBy], foreignColumns: [users.id] }),
}));

export const incidentEvidence = pgTable('incident_evidence', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').notNull().references(() => incidents.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['photo', 'video', 'document', 'audio'],
  }).notNull(),
  url: text('url').notNull(),
  uploadedBy: uuid('uploaded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
export type IncidentEvidence = typeof incidentEvidence.$inferSelect;
export type NewIncidentEvidence = typeof incidentEvidence.$inferInsert;
