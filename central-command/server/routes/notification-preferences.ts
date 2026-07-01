import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { notificationPreferences } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const prefsSchema = z.object({
  smsAlerts: z.boolean().optional(),
  pushAlerts: z.boolean().optional(),
  emailAlerts: z.boolean().optional(),
  criticalOnly: z.boolean().optional(),
  quietHoursStart: z.string().nullable().optional(),
  quietHoursEnd: z.string().nullable().optional(),
});

router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [prefs] = await db.select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, req.user!.id))
      .limit(1);

    res.json(prefs || {
      smsAlerts: true,
      pushAlerts: true,
      emailAlerts: false,
      criticalOnly: false,
      quietHoursStart: null,
      quietHoursEnd: null,
    });
  } catch (err) { next(err); }
});

router.put('/', validate(prefsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await db.select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, req.user!.id))
      .limit(1);

    let prefs;
    if (existing.length > 0) {
      [prefs] = await db.update(notificationPreferences)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, req.user!.id))
        .returning();
    } else {
      [prefs] = await db.insert(notificationPreferences).values({
        userId: req.user!.id,
        smsAlerts: req.body.smsAlerts ?? true,
        pushAlerts: req.body.pushAlerts ?? true,
        emailAlerts: req.body.emailAlerts ?? false,
        criticalOnly: req.body.criticalOnly ?? false,
        quietHoursStart: req.body.quietHoursStart ?? null,
        quietHoursEnd: req.body.quietHoursEnd ?? null,
      }).returning();
    }

    res.json(prefs);
  } catch (err) { next(err); }
});

export { router as notificationPreferencesRouter };
