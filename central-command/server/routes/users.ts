import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { users } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'state_observer', 'lga_coordinator', 'vigilante_leader', 'community_admin', 'resident']).default('community_admin'),
  lgaId: z.string().uuid().optional(),
  wardId: z.string().uuid().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'state_observer', 'lga_coordinator', 'vigilante_leader', 'community_admin', 'resident']).optional(),
  lgaId: z.string().uuid().nullable().optional(),
  wardId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().nullable().optional(),
});

router.use(authenticate);

router.get('/', requireRole('super_admin', 'state_observer', 'lga_coordinator'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
      lgaId: users.lgaId,
      wardId: users.wardId,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
      .from(users)
      .limit(limit)
      .offset(offset);

    res.json({ data: allUsers, pagination: { page, limit, offset } });
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
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', requireRole('super_admin', 'lga_coordinator'), validate(updateUserSchema), async (req, res, next) => {
  try {
    const [user] = await db.update(users)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(users.id, req.params.id as string))
      .returning();

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

    res.json({ message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
});

export { router as userRouter };
