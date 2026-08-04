import { Router } from 'express';
import { z } from 'zod';
import { eq, desc, sql } from 'drizzle-orm';
import db from '../config/db.js';
import { incidents, lgas } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { broadcast } from '../ws/index.js';

const router = Router();

const CITIZEN_TYPES = ['attack', 'fire', 'medical', 'abduction', 'other'] as const;

const createReportSchema = z.object({
  type: z.enum(CITIZEN_TYPES),
  lga: z.string().min(1),
  description: z.string().optional(),
});

const PRIORITY_MAP: Record<(typeof CITIZEN_TYPES)[number], 'critical' | 'high' | 'medium' | 'low'> = {
  attack: 'critical',
  abduction: 'critical',
  fire: 'high',
  medical: 'high',
  other: 'medium',
};

router.use(authenticate);

// Citizen-submitted reports — land in the incidents table so Central Command sees them
router.post('/', validate(createReportSchema), async (req, res, next) => {
  try {
    const { type, lga, description } = req.body as { type: (typeof CITIZEN_TYPES)[number]; lga: string; description?: string };
    const [lgaRow] = await db.select().from(lgas).where(sql`lower(${lgas.name}) = lower(${lga})`);
    if (!lgaRow) {
      res.status(400).json({ error: { code: 'INVALID_LGA', message: `Unknown LGA: ${lga}` } });
      return;
    }

    const [incident] = await db.insert(incidents).values({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} report from ${lgaRow.name}`,
      description,
      lgaId: lgaRow.id,
      priority: PRIORITY_MAP[type],
      reportedBy: req.user!.id,
    }).returning();

    broadcast('incident:new', incident);
    res.status(201).json({
      id: incident.id,
      type,
      lga: lgaRow.name,
      description: incident.description,
      timestamp: new Date(incident.createdAt).getTime(),
      status: 'submitted',
    });
  } catch (err) {
    next(err);
  }
});

// Citizen report list — shape matches user-apps QuickReport
router.get('/', async (_req, res, next) => {
  try {
    const rows = await db
      .select({
        id: incidents.id,
        type: incidents.type,
        lga: lgas.name,
        description: incidents.description,
        createdAt: incidents.createdAt,
        status: incidents.status,
      })
      .from(incidents)
      .innerJoin(lgas, eq(incidents.lgaId, lgas.id))
      .orderBy(desc(incidents.createdAt))
      .limit(50);

    res.json({
      data: rows.map((r) => ({
        id: r.id,
        type: r.type,
        lga: r.lga,
        description: r.description,
        timestamp: new Date(r.createdAt).getTime(),
        status: r.status === 'reported' ? 'submitted' : r.status,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export { router as reportRouter };
