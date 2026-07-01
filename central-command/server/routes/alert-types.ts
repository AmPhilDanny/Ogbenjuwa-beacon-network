import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { alertTypes } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createAlertTypeSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  labelIdoma: z.string().optional(),
  icon: z.string().default('⚠️'),
  color: z.string().default('#6B7280'),
  smsTemplate: z.string().optional(),
});

const updateAlertTypeSchema = createAlertTypeSchema.partial();

// Public
router.get('/', async (_req, res, next) => {
  try {
    const all = await db.select().from(alertTypes).where(eq(alertTypes.isActive, true));
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [type] = await db.select().from(alertTypes).where(eq(alertTypes.id, req.params.id as string));
    if (!type) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert type not found' } });
      return;
    }
    res.json(type);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('super_admin'), validate(createAlertTypeSchema), async (req, res, next) => {
  try {
    const [type] = await db.insert(alertTypes).values(req.body).returning();
    res.status(201).json(type);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, requireRole('super_admin'), validate(updateAlertTypeSchema), async (req, res, next) => {
  try {
    const [type] = await db.update(alertTypes)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(alertTypes.id, req.params.id as string))
      .returning();
    if (!type) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert type not found' } });
      return;
    }
    res.json(type);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requireRole('super_admin'), async (req, res, next) => {
  try {
    await db.delete(alertTypes).where(eq(alertTypes.id, req.params.id as string));
    res.json({ message: 'Alert type deleted' });
  } catch (err) {
    next(err);
  }
});

export { router as alertTypeRouter };
