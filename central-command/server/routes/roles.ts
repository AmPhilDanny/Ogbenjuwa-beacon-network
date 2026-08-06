import { Router } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import db from '../config/db.js';
import { roles } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { recordAudit } from '../lib/audit.js';

const router = Router();

const createRoleSchema = z.object({
  name: z.string().min(2).max(60),
  label: z.string().min(1),
  description: z.string().optional(),
  permissionKeys: z.array(z.string()).default([]),
});

const updateRoleSchema = createRoleSchema.partial();

// List roles + their permission keys — used by beacon (via /roles) and admin.
// Requires auth; any logged-in user may read the catalog.
router.get('/', authenticate, async (_req, res, next) => {
  try {
    const all = await db.select().from(roles).orderBy(desc(roles.createdAt));
    res.json({ data: all.map(({ updatedAt, ...r }) => ({ ...r })) });
  } catch (err) {
    next(err);
  }
});

// Public catalog: labels/keys only (no permissions) so the beacon can resolve
// role names without exposing the permission matrix.
router.get('/catalog', async (_req, res, next) => {
  try {
    const all = await db.select({ name: roles.name, label: roles.label }).from(roles).where(eq(roles.isActive, true));
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const [role] = await db.select().from(roles).where(eq(roles.id, req.params.id as string));
    if (!role) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Role not found' } });
      return;
    }
    res.json(role);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('super_admin'), validate(createRoleSchema), async (req, res, next) => {
  try {
    const existing = await db.select().from(roles).where(eq(roles.name, req.body.name));
    if (existing.length > 0) {
      res.status(409).json({ error: { code: 'DUPLICATE_ROLE', message: 'A role with this name already exists' } });
      return;
    }
    const [role] = await db.insert(roles).values({
      name: req.body.name,
      label: req.body.label,
      description: req.body.description || null,
      permissionKeys: req.body.permissionKeys,
    }).returning();
    await recordAudit({ userId: req.user!.id, action: 'CREATE', resource: 'role', resourceId: role.id, details: { name: role.name, label: role.label }, ipAddress: req.ip || null });
    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, requireRole('super_admin'), validate(updateRoleSchema), async (req, res, next) => {
  try {
    const [role] = await db.update(roles)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(roles.id, req.params.id as string))
      .returning();
    if (!role) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Role not found' } });
      return;
    }
    await recordAudit({ userId: req.user!.id, action: 'UPDATE', resource: 'role', resourceId: role.id, details: { name: role.name }, ipAddress: req.ip || null });
    res.json(role);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requireRole('super_admin'), async (req, res, next) => {
  try {
    const [role] = await db.delete(roles).where(eq(roles.id, req.params.id as string)).returning();
    if (!role) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Role not found' } });
      return;
    }
    await recordAudit({ userId: req.user!.id, action: 'DELETE', resource: 'role', resourceId: role.id, details: { name: role.name }, ipAddress: req.ip || null });
    res.json({ message: 'Role deleted' });
  } catch (err) {
    next(err);
  }
});

export { router as roleRouter };