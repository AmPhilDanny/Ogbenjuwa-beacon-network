import { Router } from 'express';
import { eq, desc, sql, and } from 'drizzle-orm';
import db from '../config/db.js';
import { alerts, incidents, patrolTeams, patrolShifts, lgas, users, sosSignals } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Aggregated dashboard stats
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const lgaId = req.query.lgaId as string;

    const alertFilter = lgaId ? eq(alerts.lgaId, lgaId) : undefined;
    const incidentFilter = lgaId ? eq(incidents.lgaId, lgaId) : undefined;
    const patrolFilter = lgaId ? eq(patrolTeams.lgaId, lgaId) : undefined;

    // Active alerts
    const [activeAlerts] = alertFilter
      ? await db.select({ count: sql<number>`count(*)::int` }).from(alerts).where(and(alertFilter, eq(alerts.status, 'active')))
      : await db.select({ count: sql<number>`count(*)::int` }).from(alerts).where(eq(alerts.status, 'active'));

    // Total users
    const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(users);

    // Total LGAs
    const [totalLgas] = await db.select({ count: sql<number>`count(*)::int` }).from(lgas);

    // Active patrols
    const [activePatrols] = patrolFilter
      ? await db.select({ count: sql<number>`count(*)::int` }).from(patrolShifts).where(and(patrolFilter as any, eq(patrolShifts.status, 'active')))
      : await db.select({ count: sql<number>`count(*)::int` }).from(patrolShifts).where(eq(patrolShifts.status, 'active'));

    // Active SOS signals
    const [activeSos] = await db.select({ count: sql<number>`count(*)::int` }).from(sosSignals).where(eq(sosSignals.status, 'active'));

    // Open incidents
    const [openIncidents] = incidentFilter
      ? await db.select({ count: sql<number>`count(*)::int` }).from(incidents).where(and(incidentFilter, sql`${incidents.status} NOT IN ('resolved', 'closed')`))
      : await db.select({ count: sql<number>`count(*)::int` }).from(incidents).where(sql`${incidents.status} NOT IN ('resolved', 'closed')`);

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
    const result = await db.execute(sql`
      SELECT l.name as lga, l.id as lga_id, COUNT(i.id)::int as count
      FROM incidents i
      JOIN lgas l ON l.id = i.lga_id
      GROUP BY l.id, l.name
      ORDER BY count DESC
    `);

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// Recent alerts feed
router.get('/recent-alerts', authenticate, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const recentAlerts = await db.select()
      .from(alerts)
      .orderBy(desc(alerts.createdAt))
      .limit(limit);
    res.json({ data: recentAlerts });
  } catch (err) {
    next(err);
  }
});

// Alert trends (last 14 days)
router.get('/trends', authenticate, async (req, res, next) => {
  try {
    const result = await db.execute(sql`
      SELECT DATE(created_at) as date, COUNT(*)::int as count, severity
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(created_at), severity
      ORDER BY date ASC
    `);

    // Flatten: { date, critical, high, medium, low, total }
    const map = new Map<string, Record<string, number>>();
    for (const row of result.rows as any[]) {
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
    const result = await db.execute(sql`
      SELECT severity, COUNT(*)::int as count
      FROM alerts
      GROUP BY severity
      ORDER BY count DESC
    `);
    res.json({ data: result.rows });
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

// CSV export — all alerts
router.get('/export/csv', authenticate, async (_req, res, next) => {
  try {
    const allAlerts = await db.select().from(alerts).orderBy(desc(alerts.createdAt));
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
