import { inArray } from 'drizzle-orm';
import db from '../config/db.js';
import { notificationPreferences } from '../db/schema/index.js';

export interface UserPrefs {
  criticalOnly: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export function inQuietHours(start: string | null, end: string | null, now: Date = new Date()): boolean {
  if (!start || !end) return false;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  if (s === e) return false;
  return s < e ? mins >= s && mins < e : mins >= s || mins < e;
}

export async function loadUserPrefs(userIds: string[]): Promise<Map<string, UserPrefs>> {
  const map = new Map<string, UserPrefs>();
  if (userIds.length === 0) return map;
  const rows = await db.select({
    userId: notificationPreferences.userId,
    criticalOnly: notificationPreferences.criticalOnly,
    quietHoursStart: notificationPreferences.quietHoursStart,
    quietHoursEnd: notificationPreferences.quietHoursEnd,
  })
    .from(notificationPreferences)
    .where(inArray(notificationPreferences.userId, userIds));
  for (const row of rows) {
    map.set(row.userId, {
      criticalOnly: row.criticalOnly,
      quietHoursStart: row.quietHoursStart,
      quietHoursEnd: row.quietHoursEnd,
    });
  }
  return map;
}

export function shouldNotify(prefs: UserPrefs | undefined, opts: { isCritical: boolean; now?: Date }): boolean {
  if (!prefs) return true;
  if (prefs.criticalOnly && !opts.isCritical) return false;
  if (!opts.isCritical && inQuietHours(prefs.quietHoursStart, prefs.quietHoursEnd, opts.now)) return false;
  return true;
}
