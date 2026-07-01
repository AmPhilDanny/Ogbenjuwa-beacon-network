import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { alertContacts } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createContactSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  village: z.string().optional(),
  lgaId: z.string().uuid(),
  wardId: z.string().uuid().optional(),
});

const updateContactSchema = createContactSchema.partial();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const lgaId = req.query.lgaId as string;
    let query = db.select().from(alertContacts);
    if (lgaId) query = query.where(eq(alertContacts.lgaId, lgaId)) as typeof query;
    const all = await query;
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [contact] = await db.select().from(alertContacts).where(eq(alertContacts.id, req.params.id as string));
    if (!contact) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Contact not found' } });
      return;
    }
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

router.post('/', requirePermission('contacts', 'create'), validate(createContactSchema), async (req, res, next) => {
  try {
    const [contact] = await db.insert(alertContacts).values({
      ...req.body,
      createdBy: req.user!.id,
    }).returning();
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requirePermission('contacts', 'update'), validate(updateContactSchema), async (req, res, next) => {
  try {
    const [contact] = await db.update(alertContacts)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(alertContacts.id, req.params.id as string))
      .returning();
    if (!contact) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Contact not found' } });
      return;
    }
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('super_admin'), async (req, res, next) => {
  try {
    await db.delete(alertContacts).where(eq(alertContacts.id, req.params.id as string));
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    next(err);
  }
});

export { router as contactRouter };
