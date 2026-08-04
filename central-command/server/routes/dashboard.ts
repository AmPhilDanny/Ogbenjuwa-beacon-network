import { Router } from 'express';
import { eq, desc, sql, and } from 'drizzle-orm';

import db from '../config/db.js';
import { alerts, incidents, patrolTeams, patrolShifts, lgas, users, sosSignals, villages } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

type LocationFilters = { lgaId?: string; wardId?: string; villageId?: string };

async function resolveLocationFilters(req: import('express').Request): Promise<LocationFilters> {
  const { lgaId, wardId, villageId } = req.query as Record<string, string | undefined>;
  let effWardId = wardId;
  if (villageId) {
    const [v] = await db.select({ wardId: villages.wardId }).from(villages).where(eq(villages.id, villageId)).limit(1);
    if (v?.wardId) effWardId = v.wardId;
  }
  return { lgaId, wardId: effWardId, villageId };
}

// Aggregated dashboard stats
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const { lgaId, wardId, villageId } = await resolveLocationFilters(req);

    // Active alerts
    const alertConds = [eq(alerts.status, 'active')];
    const incidentConds = [sql`${incidents.status} NOT IN ('resolved', 'closed')`];
    if (lgaId) {
      alertConds.push(eq(alerts.lgaId, lgaId));
      incidentConds.push(eq(incidents.lgaId, lgaId));
    }
    if (wardId) {
      alertConds.push(eq(alerts.wardId, wardId));
      incidentConds.push(eq(incidents.wardId, wardId));
    }

    const [activeAlerts] = await db.select({ count: sql<number>`count(*)::int` }).from(alerts).where(and(...alertConds));
    const [openIncidents] = await db.select({ count: sql<number>`count(*)::int` }).from(incidents).where(and(...incidentConds));

    // Total users
    const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(users);

    // Total LGAs
    const [totalLgas] = await db.select({ count: sql<number>`count(*)::int` }).from(lgas);

    // Active patrols (filtered by location via team)
    const patrolConds = [eq(patrolShifts.status, 'active')];
    if (lgaId) patrolConds.push(eq(patrolTeams.lgaId, lgaId));
    if (wardId) patrolConds.push(eq(patrolTeams.wardId, wardId));
    if (villageId) patrolConds.push(eq(patrolTeams.villageId, villageId));
    const [activePatrols] = await db.select({ count: sql<number>`count(*)::int` })
      .from(patrolShifts)
      .innerJoin(patrolTeams, eq(patrolShifts.teamId, patrolTeams.id))
      .where(and(...patrolConds));

    // Active SOS signals
    const [activeSos] = await db.select({ count: sql<number>`count(*)::int` }).from(sosSignals).where(eq(sosSignals.status, 'active'));

    res.json({
      activeAlerts: activeAlerts.count,
      totalUsers: totalUsers.count,
      totalLgas: totalLgas.count,
      activePatrols: activePatrols.count,
      activeSosSignals: activeSos.count,
      openIncidents: openIncidents.count,
    });
  } catch (err) {
    next(err);
  }
});

// Incidents grouped by LGA
router.get('/incidents-by-lga', authenticate, async (req, res, next) => {
  try {
    const { wardId } = await resolveLocationFilters(req);
    const conds = wardId ? sql`WHERE ${sql`i.ward_id = ${wardId}`}` : sql``;
    const result = await db.execute(sql`
      SELECT l.name as lga, l.id as lga_id, COUNT(i.id)::int as count
      FROM incidents i
      JOIN lgas l ON l.id = i.lga_id
      ${conds}
      GROUP BY l.id, l.name
      ORDER BY count DESC
    `);

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Recent alerts feed
router.get('/recent-alerts', authenticate, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const { lgaId, wardId } = await resolveLocationFilters(req);

    const conds: any[] = [];
    if (lgaId) conds.push(eq(alerts.lgaId, lgaId));
    if (wardId) conds.push(eq(alerts.wardId, wardId));

    let query = db.select().from(alerts).orderBy(desc(alerts.createdAt));
    if (conds.length) query = query.where(and(...conds)) as typeof query;
    const recentAlerts = await query.limit(limit);
    res.json({ data: recentAlerts });
  } catch (err) {
    next(err);
  }
});

// Alert trends (last 14 days)
router.get('/trends', authenticate, async (req, res, next) => {
  try {
    const { lgaId, wardId } = await resolveLocationFilters(req);

    const conds = [sql`created_at >= NOW() - INTERVAL '14 days'`];
    if (lgaId) conds.push(sql`lga_id = ${lgaId}`);
    if (wardId) conds.push(sql`ward_id = ${wardId}`);
    const whereSql = sql`WHERE ${and(...conds)}`;

    const result = await db.execute(sql`
      SELECT DATE(created_at) as date, COUNT(*)::int as count, severity
      FROM alerts
      ${whereSql}
      GROUP BY DATE(created_at), severity
      ORDER BY date ASC
    `);

    // Flatten: { date, critical, high, medium, low, total }
    const rows = result as any[];
    const map = new Map<string, Record<string, number>>();
    for (const row of rows) {
      const dateStr = (row.date instanceof Date ? row.date : new Date(row.date)).toISOString().slice(0, 10);
      if (!map.has(dateStr)) {
        map.set(dateStr, { critical: 0, high: 0, medium: 0, low: 0, total: 0 });
      }
      const entry = map.get(dateStr)!;
      const severity = (row.severity || 'low') as string;
      entry[severity] = (entry[severity] || 0) + row.count;
      entry.total += row.count;
    }

    const trends = Array.from(map.entries()).map(([date, counts]) => ({ date, ...counts }));
    res.json({ data: trends });
  } catch (err) {
    next(err);
  }
});

// Severity breakdown
router.get('/severity-breakdown', authenticate, async (req, res, next) => {
  try {
    const { lgaId, wardId } = await resolveLocationFilters(req);

    const conds: any[] = [];
    if (lgaId) conds.push(sql`lga_id = ${lgaId}`);
    if (wardId) conds.push(sql`ward_id = ${wardId}`);
    const whereSql = conds.length ? sql`WHERE ${and(...conds)}` : sql``;

    const result = await db.execute(sql`
      SELECT severity, COUNT(*)::int as count
      FROM alerts
      ${whereSql}
      GROUP BY severity
      ORDER BY count DESC
    `);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Public stats (no auth required)
router.get('/public-stats', async (_req, res, next) => {
  try {
    const [activePatrols] = await db.select({ count: sql<number>`count(*)::int` }).from(patrolShifts).where(eq(patrolShifts.status, 'active'));
    const [coveredLgas] = await db.select({ count: sql<number>`count(*)::int` }).from(lgas).where(eq(lgas.isActive, true));
    const [totalAlerts] = await db.select({ count: sql<number>`count(*)::int` }).from(alerts);

    res.json({
      activePatrolsToday: activePatrols.count,
      coveragePercent: Math.round((coveredLgas.count / 23) * 100), // 23 LGAs in Benue
      totalAlertsToday: totalAlerts.count,
    });
  } catch (err) {
    next(err);
  }
});

// CSV export — all alerts (optionally location-filtered)
router.get('/export/csv', authenticate, async (req, res, next) => {
  try {
    const { lgaId, wardId } = await resolveLocationFilters(req);

    const conds: any[] = [];
    if (lgaId) conds.push(eq(alerts.lgaId, lgaId));
    if (wardId) conds.push(eq(alerts.wardId, wardId));

    let query = db.select().from(alerts).orderBy(desc(alerts.createdAt));
    if (conds.length) query = query.where(and(...conds)) as typeof query;
    const allAlerts = await query;

    const csvRows = [
      'ID,Title,Type,Severity,Status,LGA,Location,ReportedBy,IsPublic,CreatedAt',
      ...allAlerts.map(a =>
        `${a.id},${JSON.stringify(a.title || '')},${a.type},${a.severity},${a.status},${a.lgaId || ''},${JSON.stringify(a.location || '')},${a.reportedBy},${a.isPublic},${a.createdAt}`
      ),
    ];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="alerts-export.csv"');
    res.send(csvRows.join('\n'));
  } catch (err) { next(err); }
});

export { router as dashboardRouter };
