import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { resources } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createResourceSchema = z.object({
  type: z.enum(['medical', 'shelter', 'water', 'food']),
  name: z.string().min(1),
  lgaId: z.string().uuid(),
  wardId: z.string().uuid().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  capacity: z.number().int().default(0),
  occupied: z.number().int().default(0),
  phone: z.string().optional(),
});

const updateResourceSchema = createResourceSchema.partial();

router.get('/', async (req, res, next) => {
  try {
    const type = req.query.type as string;
    const lgaId = req.query.lgaId as string;

    let query = db.select().from(resources);
    if (type) query = query.where(eq(resources.type, type as any)) as typeof query;
    if (lgaId) query = query.where(eq(resources.lgaId, lgaId)) as typeof query;

    const all = await query;
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [resource] = await db.select().from(resources).where(eq(resources.id, req.params.id as string));
    if (!resource) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });
      return;
    }
    res.json(resource);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('super_admin', 'lga_coordinator'), validate(createResourceSchema), async (req, res, next) => {
  try {
    const [resource] = await db.insert(resources).values(req.body).returning();
    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, requireRole('super_admin', 'lga_coordinator'), validate(updateResourceSchema), async (req, res, next) => {
  try {
    const [resource] = await db.update(resources)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(resources.id, req.params.id as string))
      .returning();
    if (!resource) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });
      return;
    }
    res.json(resource);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requireRole('super_admin'), async (req, res, next) => {
  try {
    await db.delete(resources).where(eq(resources.id, req.params.id as string));
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    next(err);
  }
});

export { router as resourceRouter };
