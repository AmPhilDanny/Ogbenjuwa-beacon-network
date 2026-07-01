import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { lgas, wards } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createLgaSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2).max(5),
  state: z.string().default('Benue'),
  region: z.string().default('Idoma'),
  coverageTarget: z.number().min(0).max(100).default(80),
});

const createWardSchema = z.object({
  name: z.string().min(1),
  lgaId: z.string().uuid(),
});

router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    const allLgas = await db.select().from(lgas);
    res.json({ data: allLgas });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [lga] = await db.select().from(lgas).where(eq(lgas.id, req.params.id as string));
    if (!lga) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'LGA not found' } });
      return;
    }
    const lgaWards = await db.select().from(wards).where(eq(wards.lgaId, lga.id));
    res.json({ ...lga, wards: lgaWards });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('super_admin'), validate(createLgaSchema), async (req, res, next) => {
  try {
    const [lga] = await db.insert(lgas).values(req.body).returning();
    res.status(201).json(lga);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/wards', async (req, res, next) => {
  try {
    const lgaWards = await db.select().from(wards).where(eq(wards.lgaId, req.params.id));
    res.json({ data: lgaWards });
  } catch (err) {
    next(err);
  }
});

router.post('/wards', requireRole('super_admin', 'lga_coordinator'), validate(createWardSchema), async (req, res, next) => {
  try {
    const [ward] = await db.insert(wards).values(req.body).returning();
    res.status(201).json(ward);
  } catch (err) {
    next(err);
  }
});

export { router as lgaRouter };
