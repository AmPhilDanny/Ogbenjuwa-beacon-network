import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { villages } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createVillageSchema = z.object({
  name: z.string().min(1),
  lgaId: z.string().uuid(),
  wardId: z.string().uuid().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  population: z.number().int().default(0),
});

const updateVillageSchema = createVillageSchema.partial();

// Public — no auth required for basic reads
router.get('/', async (req, res, next) => {
  try {
    const lgaId = req.query.lgaId as string;
    const wardId = req.query.wardId as string;

    let query = db.select().from(villages);
    if (lgaId) query = query.where(eq(villages.lgaId, lgaId)) as typeof query;
    if (wardId) query = query.where(eq(villages.wardId, wardId)) as typeof query;

    const all = await query;
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [village] = await db.select().from(villages).where(eq(villages.id, req.params.id as string));
    if (!village) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Village not found' } });
      return;
    }
    res.json(village);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('super_admin', 'lga_coordinator'), validate(createVillageSchema), async (req, res, next) => {
  try {
    const [village] = await db.insert(villages).values(req.body).returning();
    res.status(201).json(village);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, requireRole('super_admin', 'lga_coordinator'), validate(updateVillageSchema), async (req, res, next) => {
  try {
    const [village] = await db.update(villages)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(villages.id, req.params.id as string))
      .returning();
    if (!village) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Village not found' } });
      return;
    }
    res.json(village);
  } catch (err) {
    next(err);
  }
});

export { router as villageRouter };
