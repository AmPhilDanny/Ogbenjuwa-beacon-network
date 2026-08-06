import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq, desc, or, ilike, and } from 'drizzle-orm';
import db from '../config/db.js';
import { users, lgas, wards, villages } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { recordAudit } from '../lib/audit.js';

const router = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  username: z.string().min(3).optional(),
  phone: z.string().optional(),
  role: z.string().min(1).default('community_admin'),
  lgaId: z.string().uuid().nullable().optional(),
  wardId: z.string().uuid().nullable().optional(),
  villageId: z.string().uuid().nullable().optional(),
  avatar: z.string().nullable().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(3).optional(),
  phone: z.string().optional(),
  role: z.string().min(1).optional(),
  lgaId: z.string().uuid().nullable().optional(),
  wardId: z.string().uuid().nullable().optional(),
  villageId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().nullable().optional(),
  password: z.string().min(8).optional(),
});

router.use(authenticate);

router.get('/', requireRole('super_admin', 'state_observer', 'lga_coordinator'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;

    const search = ((req.query.search as string) || '').trim();
    const role = req.query.role as string | undefined;

    let query = db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      username: users.username,
      phone: users.phone,
      role: users.role,
      lgaId: users.lgaId,
      wardId: users.wardId,
      villageId: users.villageId,
      lgaName: lgas.name,
      wardName: wards.name,
      villageName: villages.name,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
      .from(users)
      .leftJoin(lgas, eq(users.lgaId, lgas.id))
      .leftJoin(wards, eq(users.wardId, wards.id))
      .leftJoin(villages, eq(users.villageId, villages.id));

    if (search) {
      const pattern = `%${search}%`;
      query = query.where(or(ilike(users.name, pattern), ilike(users.email, pattern))) as typeof query;
    }
    if (role) {
      query = query.where(eq(users.role, role as unknown as typeof users.role)) as typeof query;
    }

    const allUsers = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ data: allUsers, pagination: { page, limit, offset } });
  } catch (err) {
    next(err);
  }
});

// Security: role-scoped directory — residents only see their own LGA; leadership sees phones, others don't.
router.get('/community', async (req, res, next) => {
  try {
    const viewer = req.user!;
    const isLeadership = ['super_admin', 'state_observer', 'lga_coordinator', 'vigilante_leader'].includes(viewer.role);

    const conds = [eq(users.isActive, true)];
    const isStateWide = viewer.role === 'super_admin' || viewer.role === 'state_observer';
    if (!isStateWide && viewer.lgaId) {
      conds.push(eq(users.lgaId, viewer.lgaId));
    }

    const roleFilter = req.query.role as string | undefined;
    if (roleFilter) conds.push(eq(users.role, roleFilter as any));

    const directory = await db.select({
      id: users.id,
      name: users.name,
      role: users.role,
      lgaId: users.lgaId,
      wardId: users.wardId,
      villageId: users.villageId,
      lgaName: lgas.name,
      wardName: wards.name,
      villageName: villages.name,
      phone: users.phone,
    })
      .from(users)
      .leftJoin(lgas, eq(users.lgaId, lgas.id))
      .leftJoin(wards, eq(users.wardId, wards.id))
      .leftJoin(villages, eq(users.villageId, villages.id))
      .where(and(...conds))
      .orderBy(users.name)
      .limit(200);

    const safe = isLeadership
      ? directory
      : directory.map(({ phone: _p, ...rest }) => rest);

    res.json({ data: safe });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireRole('super_admin', 'state_observer', 'lga_coordinator'), async (req, res, next) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.params.id as string));
    if (!user) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }
    const { passwordHash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('super_admin', 'lga_coordinator'), validate(createUserSchema), async (req, res, next) => {
  try {
    const existing = await db.select().from(users).where(eq(users.email, req.body.email));
    if (existing.length > 0) {
      res.status(409).json({ error: { code: 'DUPLICATE_EMAIL', message: 'Email already in use' } });
      return;
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const [user] = await db.insert(users).values({
      ...req.body,
      passwordHash,
    }).returning();

    const { passwordHash: _, ...safe } = user;
    await recordAudit({ userId: req.user!.id, action: 'CREATE', resource: 'user', resourceId: user.id, details: { email: user.email, role: user.role }, ipAddress: req.ip || null });
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireRole('super_admin', 'lga_coordinator'), validate(updateUserSchema), async (req, res, next) => {
  try {
    const { password, ...fields } = req.body;
    const updates: Record<string, unknown> = { ...fields, updatedAt: new Date() };
    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 12);
    }
    const [user] = await db.update(users)
      .set(updates)
      .where(eq(users.id, req.params.id as string))
      .returning();

    if (!user) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }

    const { passwordHash, ...safe } = user;
    await recordAudit({ userId: req.user!.id, action: 'UPDATE', resource: 'user', resourceId: user.id, details: { email: user.email, role: user.role }, ipAddress: req.ip || null });
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireRole('super_admin'), async (req, res, next) => {
  try {
    const [user] = await db.update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, req.params.id as string))
      .returning();

    if (!user) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }

    await recordAudit({ userId: req.user!.id, action: 'DELETE', resource: 'user', resourceId: user.id, details: { email: user.email }, ipAddress: req.ip || null });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
});

export { router as userRouter };
