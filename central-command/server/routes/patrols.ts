import { Router } from 'express';
import { z } from 'zod';
import { eq, desc, gte, and, sql } from 'drizzle-orm';
import db from '../config/db.js';
import { patrolTeams, patrolMembers, patrolShifts, patrolCheckins, lgas, wards, villages, users } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { broadcast } from '../ws/index.js';

const router = Router();

const createTeamSchema = z.object({
  name: z.string().min(1),
  lgaId: z.string().uuid(),
  wardId: z.string().uuid().nullable().optional(),
  villageId: z.string().uuid().nullable().optional(),
  leaderId: z.string().uuid(),
});

const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  lgaId: z.string().uuid().optional(),
  wardId: z.string().uuid().nullable().optional(),
  villageId: z.string().uuid().nullable().optional(),
  leaderId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

const createShiftSchema = z.object({
  teamId: z.string().uuid(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  notes: z.string().optional(),
});

const updateShiftSchema = z.object({
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled']).optional(),
  date: z.string().min(1).optional(),
  startTime: z.string().min(1).optional(),
  endTime: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
});

const addMemberSchema = z.object({
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
});

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const lgaId = req.query.lgaId as string;
    const wardId = req.query.wardId as string;
    const villageId = req.query.villageId as string;

    let query = db.select({
      id: patrolTeams.id,
      name: patrolTeams.name,
      lgaId: patrolTeams.lgaId,
      wardId: patrolTeams.wardId,
      villageId: patrolTeams.villageId,
      leaderId: patrolTeams.leaderId,
      memberCount: patrolTeams.memberCount,
      isActive: patrolTeams.isActive,
      createdAt: patrolTeams.createdAt,
      lgaName: lgas.name,
      leaderName: users.name,
    })
      .from(patrolTeams)
      .leftJoin(lgas, eq(patrolTeams.lgaId, lgas.id))
      .leftJoin(users, eq(patrolTeams.leaderId, users.id));

    const conditions = [];
    if (lgaId) conditions.push(eq(patrolTeams.lgaId, lgaId));
    if (wardId) conditions.push(eq(patrolTeams.wardId, wardId));
    if (villageId) conditions.push(eq(patrolTeams.villageId, villageId));
    if (conditions.length) query = query.where(and(...conditions)) as typeof query;

    const allTeams = await query;

    // Real member count per team (authoritative over stored memberCount)
    const counts = await db.select({
      teamId: patrolMembers.teamId,
      count: sql<number>`count(*)::int`,
    })
      .from(patrolMembers)
      .groupBy(patrolMembers.teamId);

    const countMap = new Map(counts.map((c) => [c.teamId, c.count]));
    const result = allTeams.map((t) => ({ ...t, memberCount: countMap.get(t.id) ?? 0 }));

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/', requirePermission('patrols', 'create'), validate(createTeamSchema), async (req, res, next) => {
  try {
    const [team] = await db.insert(patrolTeams).values({
      name: req.body.name,
      lgaId: req.body.lgaId,
      wardId: req.body.wardId ?? null,
      villageId: req.body.villageId ?? null,
      leaderId: req.body.leaderId,
    }).returning();

    broadcast('patrol:team-created', team);
    res.status(201).json(team);
  } catch (err) {
    next(err);
  }
});

router.get('/teams', async (_req, res, next) => {
  try {
    // Real live patrol view: teams with their assigned area + latest checkin per member
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const allTeams = await db.select({
      id: patrolTeams.id,
      name: patrolTeams.name,
      lgaId: patrolTeams.lgaId,
      wardId: patrolTeams.wardId,
      villageId: patrolTeams.villageId,
      leaderId: patrolTeams.leaderId,
      isActive: patrolTeams.isActive,
    }).from(patrolTeams);

    const recent = await db.select({
      memberId: patrolCheckins.memberId,
      lat: patrolCheckins.lat,
      lng: patrolCheckins.lng,
      timestamp: patrolCheckins.timestamp,
      shiftId: patrolCheckins.shiftId,
    })
      .from(patrolCheckins)
      .where(gte(patrolCheckins.timestamp, tenMinAgo))
      .orderBy(desc(patrolCheckins.timestamp));

    // Latest checkin per member
    const latestMap = new Map<string, typeof recent[0]>();
    for (const r of recent) {
      if (!latestMap.has(r.memberId)) latestMap.set(r.memberId, r);
    }

    // Member -> team mapping
    const members = await db.select({
      teamId: patrolMembers.teamId,
      userId: patrolMembers.userId,
      name: users.name,
    })
      .from(patrolMembers)
      .leftJoin(users, eq(patrolMembers.userId, users.id));

    const teamMembers = new Map<string, typeof members>();
    for (const m of members) {
      if (!teamMembers.has(m.teamId)) teamMembers.set(m.teamId, []);
      teamMembers.get(m.teamId)!.push(m);
    }

    const result = allTeams.map((t, idx) => {
      const teamMemberIds = (teamMembers.get(t.id) || []).map((m) => m.userId);
      const activeMembers = teamMemberIds
        .map((userId) => {
          const loc = latestMap.get(userId);
          return loc
            ? {
                memberId: userId,
                active: true,
                lastSeen: loc.timestamp,
                lat: Number(loc.lat),
                lng: Number(loc.lng),
              }
            : { memberId: userId, active: false, lastSeen: null, lat: null, lng: null };
        })
        .filter((m) => m.active);

      return {
        id: t.id,
        name: t.name,
        role: t.isActive ? 'Active' : 'Standby',
        lat: activeMembers[0]?.lat ?? 7.15 + (idx * 0.05),
        lng: activeMembers[0]?.lng ?? 8.13 + (idx * 0.03),
        active: t.isActive && activeMembers.length > 0,
        lastSeen: activeMembers[0]?.lastSeen ?? 'No recent check-in',
      };
    });

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [team] = await db.select({
      id: patrolTeams.id,
      name: patrolTeams.name,
      lgaId: patrolTeams.lgaId,
      wardId: patrolTeams.wardId,
      villageId: patrolTeams.villageId,
      leaderId: patrolTeams.leaderId,
      memberCount: patrolTeams.memberCount,
      isActive: patrolTeams.isActive,
      createdAt: patrolTeams.createdAt,
      lgaName: lgas.name,
      leaderName: users.name,
    })
      .from(patrolTeams)
      .leftJoin(lgas, eq(patrolTeams.lgaId, lgas.id))
      .leftJoin(users, eq(patrolTeams.leaderId, users.id))
      .where(eq(patrolTeams.id, req.params.id as string));

    if (!team) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patrol team not found' } });
      return;
    }

    const [ward] = team.wardId ? await db.select({ name: wards.name }).from(wards).where(eq(wards.id, team.wardId)) : [undefined];
    const [village] = team.villageId ? await db.select({ name: villages.name }).from(villages).where(eq(villages.id, team.villageId)) : [undefined];

    const members = await db.select({
      id: patrolMembers.id,
      teamId: patrolMembers.teamId,
      userId: patrolMembers.userId,
      joinedAt: patrolMembers.joinedAt,
      name: users.name,
      role: users.role,
    })
      .from(patrolMembers)
      .leftJoin(users, eq(patrolMembers.userId, users.id))
      .where(eq(patrolMembers.teamId, team.id));

    const shifts = await db.select().from(patrolShifts).where(eq(patrolShifts.teamId, team.id)).orderBy(desc(patrolShifts.date));

    res.json({ ...team, wardName: ward?.name, villageName: village?.name, members, shifts });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requirePermission('patrols', 'update'), validate(updateTeamSchema), async (req, res, next) => {
  try {
    const [team] = await db.update(patrolTeams)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(patrolTeams.id, req.params.id as string))
      .returning();

    if (!team) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patrol team not found' } });
      return;
    }

    broadcast('patrol:team-updated', team);
    res.json(team);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requirePermission('patrols', 'delete'), async (req, res, next) => {
  try {
    const [team] = await db.delete(patrolTeams)
      .where(eq(patrolTeams.id, req.params.id as string))
      .returning();

    if (!team) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patrol team not found' } });
      return;
    }

    broadcast('patrol:team-deleted', { id: team.id });
    res.json({ message: 'Patrol team deleted' });
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

    broadcast('patrol:shift-created', shift);
    res.status(201).json(shift);
  } catch (err) {
    next(err);
  }
});

router.put('/shifts/:id', requirePermission('patrols', 'update'), validate(updateShiftSchema), async (req, res, next) => {
  try {
    const [shift] = await db.update(patrolShifts)
      .set(req.body)
      .where(eq(patrolShifts.id, req.params.id as string))
      .returning();

    if (!shift) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patrol shift not found' } });
      return;
    }

    broadcast('patrol:shift-updated', shift);
    res.json(shift);
  } catch (err) {
    next(err);
  }
});

router.delete('/shifts/:id', requirePermission('patrols', 'delete'), async (req, res, next) => {
  try {
    const [shift] = await db.delete(patrolShifts)
      .where(eq(patrolShifts.id, req.params.id as string))
      .returning();

    if (!shift) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patrol shift not found' } });
      return;
    }

    broadcast('patrol:shift-deleted', { id: shift.id });
    res.json({ message: 'Patrol shift deleted' });
  } catch (err) {
    next(err);
  }
});

router.post('/members', requirePermission('patrols', 'update'), validate(addMemberSchema), async (req, res, next) => {
  try {
    // Validate team + user exist
    const [team] = await db.select().from(patrolTeams).where(eq(patrolTeams.id, req.body.teamId));
    const [user] = await db.select().from(users).where(eq(users.id, req.body.userId));
    if (!team || !user) {
      res.status(400).json({ error: { code: 'INVALID_REF', message: 'Team or user not found' } });
      return;
    }

    // Avoid duplicates
    const [existing] = await db.select().from(patrolMembers)
      .where(and(eq(patrolMembers.teamId, req.body.teamId), eq(patrolMembers.userId, req.body.userId)));
    if (existing) {
      res.status(409).json({ error: { code: 'ALREADY_MEMBER', message: 'User is already a member of this team' } });
      return;
    }

    const [member] = await db.insert(patrolMembers).values({
      teamId: req.body.teamId,
      userId: req.body.userId,
    }).returning();

    // Sync stored member count
    const counts = await db.select({ count: sql<number>`count(*)::int` })
      .from(patrolMembers)
      .where(eq(patrolMembers.teamId, req.body.teamId));
    await db.update(patrolTeams)
      .set({ memberCount: counts[0]?.count ?? 0, updatedAt: new Date() })
      .where(eq(patrolTeams.id, req.body.teamId));

    broadcast('patrol:member-added', member);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
});

router.delete('/members/:id', requirePermission('patrols', 'update'), async (req, res, next) => {
  try {
    const [member] = await db.delete(patrolMembers)
      .where(eq(patrolMembers.id, req.params.id as string))
      .returning();

    if (!member) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patrol member not found' } });
      return;
    }

    // Sync stored member count
    const counts = await db.select({ count: sql<number>`count(*)::int` })
      .from(patrolMembers)
      .where(eq(patrolMembers.teamId, member.teamId));
    await db.update(patrolTeams)
      .set({ memberCount: counts[0]?.count ?? 0, updatedAt: new Date() })
      .where(eq(patrolTeams.id, member.teamId));

    broadcast('patrol:member-removed', { id: member.id, teamId: member.teamId });
    res.json({ message: 'Patrol member removed' });
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

router.get('/checkins/live', authenticate, async (_req, res, next) => {
  try {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recent = await db.select({
      memberId: patrolCheckins.memberId,
      memberName: users.name,
      lat: patrolCheckins.lat,
      lng: patrolCheckins.lng,
      timestamp: patrolCheckins.timestamp,
      shiftId: patrolCheckins.shiftId,
    })
      .from(patrolCheckins)
      .leftJoin(users, eq(patrolCheckins.memberId, users.id))
      .where(gte(patrolCheckins.timestamp, tenMinAgo))
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
