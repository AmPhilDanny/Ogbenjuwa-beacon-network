import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { lgas, wards, villages } from '../db/schema/index.js';
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
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

const updateLgaSchema = createLgaSchema.partial();

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
    const lgaVillages = await db.select().from(villages).where(eq(villages.lgaId, lga.id));
    res.json({ ...lga, wards: lgaWards, villages: lgaVillages });
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

router.put('/:id', requireRole('super_admin'), validate(updateLgaSchema), async (req, res, next) => {
  try {
    const [lga] = await db.update(lgas)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(lgas.id, req.params.id as string))
      .returning();
    if (!lga) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'LGA not found' } });
      return;
    }
    res.json(lga);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('super_admin'), async (req, res, next) => {
  try {
    const [lga] = await db.select().from(lgas).where(eq(lgas.id, req.params.id as string));
    if (!lga) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'LGA not found' } });
      return;
    }
    // Cascade delete children first (villages then wards) since villages FK is not ON DELETE CASCADE
    await db.delete(villages).where(eq(villages.lgaId, lga.id));
    await db.delete(wards).where(eq(wards.lgaId, lga.id));
    await db.delete(lgas).where(eq(lgas.id, lga.id));
    res.json({ message: 'LGA deleted' });
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

const updateWardSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
}).refine((v) => v.name !== undefined || v.isActive !== undefined, {
  message: 'At least one of name or isActive is required',
});

router.put('/:id/wards/:wardId', requireRole('super_admin'), validate(updateWardSchema), async (req, res, next) => {
  try {
    const [ward] = await db.update(wards)
      .set(req.body)
      .where(eq(wards.id, req.params.wardId as string))
      .returning();
    if (!ward) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ward not found' } });
      return;
    }
    res.json(ward);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/wards/:wardId', requireRole('super_admin'), async (req, res, next) => {
  try {
    const [ward] = await db.select().from(wards).where(eq(wards.id, req.params.wardId as string));
    if (!ward) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ward not found' } });
      return;
    }
    // Detach villages from the ward before deleting it
    await db.update(villages).set({ wardId: null }).where(eq(villages.wardId, ward.id));
    await db.delete(wards).where(eq(wards.id, ward.id));
    res.json({ message: 'Ward deleted' });
  } catch (err) {
    next(err);
  }
});

export { router as lgaRouter };
