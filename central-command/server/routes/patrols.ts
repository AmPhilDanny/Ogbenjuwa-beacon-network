import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { patrolTeams, patrolMembers, patrolShifts, patrolCheckins } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { broadcast } from '../ws/index.js';

const router = Router();

const createTeamSchema = z.object({
  name: z.string().min(1),
  lgaId: z.string().uuid(),
  wardId: z.string().uuid().optional(),
  leaderId: z.string().uuid(),
});

const createShiftSchema = z.object({
  teamId: z.string().uuid(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  notes: z.string().optional(),
});

router.use(authenticate);

router.get('/', async (_req, res, next) => {
  try {
    const allTeams = await db.select().from(patrolTeams);
    res.json({ data: allTeams });
  } catch (err) {
    next(err);
  }
});

router.post('/', requirePermission('patrols', 'create'), validate(createTeamSchema), async (req, res, next) => {
  try {
    const [team] = await db.insert(patrolTeams).values(req.body).returning();
    res.status(201).json(team);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [team] = await db.select().from(patrolTeams).where(eq(patrolTeams.id, req.params.id as string));
    if (!team) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patrol team not found' } });
      return;
    }

    const members = await db.select().from(patrolMembers).where(eq(patrolMembers.teamId, team.id));
    const shifts = await db.select().from(patrolShifts).where(eq(patrolShifts.teamId, team.id));

    res.json({ ...team, members, shifts });
  } catch (err) {
    next(err);
  }
});

router.post('/shifts', requirePermission('patrols', 'update'), validate(createShiftSchema), async (req, res, next) => {
  try {
    const [shift] = await db.insert(patrolShifts).values({
      ...req.body,
      createdBy: req.user!.id,
    }).returning();

    res.status(201).json(shift);
  } catch (err) {
    next(err);
  }
});

const checkinSchema = z.object({
  shiftId: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  note: z.string().optional(),
});

router.post('/checkin', authenticate, validate(checkinSchema), async (req, res, next) => {
  try {
    const [checkin] = await db.insert(patrolCheckins).values({
      shiftId: req.body.shiftId,
      memberId: req.user!.id,
      lat: String(req.body.lat),
      lng: String(req.body.lng),
      note: req.body.note || null,
    }).returning();

    broadcast('patrol:location', {
      memberId: req.user!.id,
      lat: req.body.lat,
      lng: req.body.lng,
      timestamp: checkin.timestamp,
      shiftId: req.body.shiftId,
    });

    res.status(201).json(checkin);
  } catch (err) {
    next(err);
  }
});

router.get('/checkins/live', authenticate, async (req, res, next) => {
  try {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recent = await db.select({
      memberId: patrolCheckins.memberId,
      lat: patrolCheckins.lat,
      lng: patrolCheckins.lng,
      timestamp: patrolCheckins.timestamp,
      shiftId: patrolCheckins.shiftId,
    })
      .from(patrolCheckins)
      .where(patrolCheckins.timestamp >= tenMinAgo)
      .orderBy(desc(patrolCheckins.timestamp));

    // Get latest per member
    const latestMap = new Map<string, typeof recent[0]>();
    for (const r of recent) {
      if (!latestMap.has(r.memberId)) latestMap.set(r.memberId, r);
    }

    res.json({ data: Array.from(latestMap.values()) });
  } catch (err) {
    next(err);
  }
});

export { router as patrolRouter };
