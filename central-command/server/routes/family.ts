import { Router } from 'express';
import { z } from 'zod';
import { eq, like, or, desc } from 'drizzle-orm';
import db from '../config/db.js';
import { familyRegistry } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createEntrySchema = z.object({
  name: z.string().min(1),
  age: z.number().int().optional(),
  gender: z.enum(['M', 'F']).optional(),
  lgaId: z.string().uuid(),
  village: z.string().optional(),
  status: z.enum(['at_camp', 'searching', 'reunified']).default('searching'),
  camp: z.string().optional(),
  notes: z.string().optional(),
});

const updateEntrySchema = createEntrySchema.partial();

router.use(authenticate);

// Search endpoint — open to all authenticated users
router.get('/search', async (req, res, next) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      res.json({ data: [] });
      return;
    }

    const all = await db.select()
      .from(familyRegistry)
      .where(or(
        like(familyRegistry.name, `%${q}%`),
        like(familyRegistry.village, `%${q}%`),
      ))
      .limit(20);

    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const lgaId = req.query.lgaId as string;
    const status = req.query.status as string;

    let query = db.select().from(familyRegistry).orderBy(desc(familyRegistry.registeredAt));
    if (lgaId) query = query.where(eq(familyRegistry.lgaId, lgaId)) as typeof query;
    if (status) query = query.where(eq(familyRegistry.status, status as any)) as typeof query;

    const all = await query;
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [entry] = await db.select().from(familyRegistry).where(eq(familyRegistry.id, req.params.id as string));
    if (!entry) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Family entry not found' } });
      return;
    }
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

router.post('/', requirePermission('family', 'create'), validate(createEntrySchema), async (req, res, next) => {
  try {
    const [entry] = await db.insert(familyRegistry).values({
      ...req.body,
      registeredBy: req.user!.id,
    }).returning();
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requirePermission('family', 'update'), validate(updateEntrySchema), async (req, res, next) => {
  try {
    const [entry] = await db.update(familyRegistry)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(familyRegistry.id, req.params.id as string))
      .returning();
    if (!entry) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Family entry not found' } });
      return;
    }
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('super_admin'), async (req, res, next) => {
  try {
    await db.delete(familyRegistry).where(eq(familyRegistry.id, req.params.id as string));
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
});

export { router as familyRouter };
