import { Router } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import db from '../config/db.js';
import { incidents } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { broadcast } from '../ws/index.js';

const router = Router();

const createIncidentSchema = z.object({
  alertId: z.string().uuid().optional(),
  type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  lgaId: z.string().uuid(),
  wardId: z.string().uuid().optional(),
  location: z.string().optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  assignedTo: z.string().uuid().optional(),
});

const updateIncidentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['reported', 'investigating', 'resolved', 'closed']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  responseNotes: z.string().optional(),
});

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const allIncidents = await db.select()
      .from(incidents)
      .orderBy(desc(incidents.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ data: allIncidents, pagination: { page, limit, offset } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, req.params.id as string));
    if (!incident) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Incident not found' } });
      return;
    }
    res.json(incident);
  } catch (err) {
    next(err);
  }
});

router.post('/', requirePermission('incidents', 'create'), validate(createIncidentSchema), async (req, res, next) => {
  try {
    const [incident] = await db.insert(incidents).values({
      ...req.body,
      reportedBy: req.user!.id,
    }).returning();

    broadcast('incident:new', incident);
    res.status(201).json(incident);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requirePermission('incidents', 'update'), validate(updateIncidentSchema), async (req, res, next) => {
  try {
    const [incident] = await db.update(incidents)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(incidents.id, req.params.id as string))
      .returning();

    if (!incident) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Incident not found' } });
      return;
    }

    broadcast('incident:updated', incident);
    res.json(incident);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/resolve', requirePermission('incidents', 'update'), async (req, res, next) => {
  try {
    const { notes } = req.body || {};
    const [incident] = await db.update(incidents)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: req.user!.id,
        responseNotes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(incidents.id, req.params.id as string))
      .returning();

    if (!incident) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Incident not found' } });
      return;
    }

    broadcast('incident:resolved', incident);
    res.json(incident);
  } catch (err) {
    next(err);
  }
});

export { router as incidentRouter };
