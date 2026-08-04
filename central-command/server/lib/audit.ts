import db from '../config/db.js';
import { auditLogs, type NewAuditLog } from '../db/schema/index.js';

export async function recordAudit(entry: Omit<NewAuditLog, 'id' | 'createdAt'>): Promise<void> {
  try {
    await db.insert(auditLogs).values(entry);
  } catch (err) {
    console.error('Failed to record audit log', err);
  }
}
