import { Router } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import db from '../config/db.js';
import { sosSignals } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { broadcast } from '../ws/index.js';

const router = Router();

const createSosSchema = z.object({
  lgaId: z.string().uuid(),
  location: z.string().optional(),
});

const updateSosSchema = z.object({
  status: z.enum(['active', 'responding', 'resolved']).optional(),
  location: z.string().optional(),
  respondedBy: z.string().uuid().nullable().optional(),
});

router.use(authenticate);

// Anyone authenticated can trigger an SOS
router.post('/', validate(createSosSchema), async (req, res, next) => {
  try {
    const [signal] = await db.insert(sosSignals).values({
      userId: req.user!.id,
      lgaId: req.body.lgaId,
      location: req.body.location || null,
    }).returning();

    broadcast('sos:new', signal);
    res.status(201).json(signal);
  } catch (err) {
    next(err);
  }
});

// Responders + command see the active SOS list
router.get('/', requireRole('super_admin', 'state_observer', 'lga_coordinator', 'vigilante_leader'), async (req, res, next) => {
  try {
    const status = req.query.status as string;
    const rows = status
      ? await db.select().from(sosSignals).where(eq(sosSignals.status, status as 'active' | 'responding' | 'resolved')).orderBy(desc(sosSignals.createdAt))
      : await db.select().from(sosSignals).orderBy(desc(sosSignals.createdAt));
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireRole('super_admin', 'state_observer', 'lga_coordinator', 'vigilante_leader'), async (req, res, next) => {
  try {
    const [signal] = await db.select().from(sosSignals).where(eq(sosSignals.id, req.params.id as string));
    if (!signal) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'SOS signal not found' } });
      return;
    }
    res.json(signal);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireRole('super_admin', 'state_observer', 'lga_coordinator'), validate(updateSosSchema), async (req, res, next) => {
  try {
    const updates: Record<string, unknown> = { ...req.body };
    if (updates.status === 'resolved') {
      updates.resolvedAt = new Date();
    }
    const [signal] = await db.update(sosSignals)
      .set(updates)
      .where(eq(sosSignals.id, req.params.id as string))
      .returning();

    if (!signal) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'SOS signal not found' } });
      return;
    }

    broadcast('sos:updated', signal);
    res.json(signal);
  } catch (err) {
    next(err);
  }
});

// The SOS owner keeps sharing their live location until they resolve it
router.post('/:id/location', validate(z.object({ location: z.string().min(1) })), async (req, res, next) => {
  try {
    const [signal] = await db.select().from(sosSignals).where(eq(sosSignals.id, req.params.id as string));
    if (!signal) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'SOS signal not found' } });
      return;
    }
    if (signal.userId !== req.user!.id) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your SOS signal' } });
      return;
    }
    const [updated] = await db.update(sosSignals)
      .set({ location: req.body.location })
      .where(eq(sosSignals.id, signal.id))
      .returning();
    broadcast('sos:location', updated);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// The SOS owner can deactivate / resolve their own active panic
router.post('/:id/resolve', async (req, res, next) => {
  try {
    const [signal] = await db.select().from(sosSignals).where(eq(sosSignals.id, req.params.id as string));
    if (!signal) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'SOS signal not found' } });
      return;
    }
    const isOwner = signal.userId === req.user!.id;
    const isResponder = ['super_admin', 'state_observer', 'lga_coordinator'].includes(req.user!.role);
    if (!isOwner && !isResponder) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not authorized to resolve this SOS' } });
      return;
    }

    const [updated] = await db.update(sosSignals)
      .set({ status: 'resolved', resolvedAt: new Date(), respondedBy: isResponder ? req.user!.id : signal.respondedBy })
      .where(eq(sosSignals.id, signal.id))
      .returning();

    broadcast('sos:updated', updated);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export { router as sosRouter };
