import { Router } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import db from '../config/db.js';
import { alerts, notifications, users } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { broadcast } from '../ws/index.js';

const router = Router();

const createAlertSchema = z.object({
  type: z.string().min(1),
  severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  title: z.string().min(1),
  description: z.string().optional(),
  lgaId: z.string().uuid(),
  wardId: z.string().uuid().optional(),
  location: z.string().optional(),
  isPublic: z.boolean().default(false),
});

const updateAlertSchema = z.object({
  severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
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

    // Insert in-app notification for all users in the same LGA
    try {
      const targetUsers = await db.select({ id: users.id }).from(users)
        .where(eq(users.lgaId, req.body.lgaId));
      for (const u of targetUsers) {
        await db.insert(notifications).values({
          userId: u.id,
          type: 'alert',
          title: alert.title,
          body: `[${alert.severity.toUpperCase()}] ${alert.description || alert.title}`,
          resourceType: 'alert',
          resourceId: alert.id,
        }).execute();
      }
    } catch {
      // Notification insert is non-critical — don't fail the request
    }

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
    res.json(alert);
  } catch (err) {
    next(err);
  }
});

export { router as alertRouter };
