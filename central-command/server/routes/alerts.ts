import { Router } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import db from '../config/db.js';
import { alerts, notifications, users } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { broadcast } from '../ws/index.js';
import { recordAudit } from '../lib/audit.js';
import { loadUserPrefs, shouldNotify } from '../lib/notify-policy.js';

const router = Router();

const createAlertSchema = z.object({
  type: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  title: z.string().min(1),
  description: z.string().optional(),
  lgaId: z.string().uuid(),
  wardId: z.string().uuid().optional(),
  location: z.string().optional(),
  contactPhone: z.string().max(30).optional().nullable(),
  isPublic: z.boolean().default(false),
});

const updateAlertSchema = z.object({
  type: z.string().min(1).optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  lgaId: z.string().uuid().optional(),
  wardId: z.string().uuid().nullable().optional(),
  location: z.string().optional(),
  contactPhone: z.string().max(30).optional().nullable(),
  status: z.enum(['active', 'investigating', 'resolved', 'false_alarm']).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  isPublic: z.boolean().optional(),
});

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const allAlerts = await db.select()
      .from(alerts)
      .orderBy(desc(alerts.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ data: allAlerts, pagination: { page, limit, offset } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, req.params.id as string));
    if (!alert) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
      return;
    }
    res.json(alert);
  } catch (err) {
    next(err);
  }
});

router.post('/', requirePermission('alerts', 'create'), validate(createAlertSchema), async (req, res, next) => {
  try {
    const [alert] = await db.insert(alerts).values({
      ...req.body,
      reportedBy: req.user!.id,
    }).returning();

    broadcast('alert:new', alert);

    // Insert in-app notification for all users in the same LGA (respecting their preferences)
    try {
      const targetUsers = await db.select({ id: users.id }).from(users)
        .where(eq(users.lgaId, req.body.lgaId));
      if (targetUsers.length > 0) {
        const prefs = await loadUserPrefs(targetUsers.map(u => u.id));
        const isCritical = req.body.severity === 'critical';
        for (const u of targetUsers) {
          if (!shouldNotify(prefs.get(u.id), { isCritical })) continue;
          await db.insert(notifications).values({
            userId: u.id,
            type: 'alert',
            title: alert.title,
            body: `[${alert.severity.toUpperCase()}] ${alert.description || alert.title}`,
            resourceType: 'alert',
            resourceId: alert.id,
          }).execute();
        }
      }
    } catch {
      // Notification insert is non-critical — don't fail the request
    }

    await recordAudit({ userId: req.user!.id, action: 'CREATE', resource: 'alert', resourceId: alert.id, details: { title: alert.title, severity: alert.severity, lgaId: alert.lgaId }, ipAddress: req.ip || null });
    res.status(201).json(alert);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requirePermission('alerts', 'update'), validate(updateAlertSchema), async (req, res, next) => {
  try {
    const [alert] = await db.update(alerts)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(alerts.id, req.params.id as string))
      .returning();

    if (!alert) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
      return;
    }

    broadcast('alert:updated', alert);
    await recordAudit({ userId: req.user!.id, action: 'UPDATE', resource: 'alert', resourceId: alert.id, details: { title: alert.title, status: alert.status }, ipAddress: req.ip || null });
    res.json(alert);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/resolve', requirePermission('alerts', 'resolve'), async (req, res, next) => {
  try {
    const [alert] = await db.update(alerts)
      .set({ status: 'resolved', resolvedAt: new Date(), resolvedBy: req.user!.id, updatedAt: new Date() })
      .where(eq(alerts.id, req.params.id as string))
      .returning();

    if (!alert) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
      return;
    }

    broadcast('alert:resolved', alert);
    await recordAudit({ userId: req.user!.id, action: 'UPDATE', resource: 'alert', resourceId: alert.id, details: { title: alert.title, status: 'resolved' }, ipAddress: req.ip || null });
    res.json(alert);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requirePermission('alerts', 'delete'), async (req, res, next) => {
  try {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, req.params.id as string));
    if (!alert) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
      return;
    }
    await db.delete(alerts).where(eq(alerts.id, alert.id));
    broadcast('alert:deleted', { id: alert.id });
    await recordAudit({ userId: req.user!.id, action: 'DELETE', resource: 'alert', resourceId: alert.id, details: { title: alert.title }, ipAddress: req.ip || null });
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    next(err);
  }
});

export { router as alertRouter };
