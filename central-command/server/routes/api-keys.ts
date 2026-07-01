import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { apiKeys } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createKeySchema = z.object({
  name: z.string().min(1),
  layer: z.enum(['layer1', 'layer2', 'external']),
  permissions: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
});

const updateKeySchema = z.object({
  name: z.string().min(1).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

router.use(authenticate);
router.use(requireRole('super_admin'));

router.get('/', async (req, res, next) => {
  try {
    const all = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      layer: apiKeys.layer,
      permissions: apiKeys.permissions,
      isActive: apiKeys.isActive,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    }).from(apiKeys);

    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(createKeySchema), async (req, res, next) => {
  try {
    const rawKey = `ogb_${crypto.randomBytes(24).toString('hex')}`;
    const prefix = rawKey.substring(0, 12);
    const keyHash = await bcrypt.hash(rawKey, 10);

    const [key] = await db.insert(apiKeys).values({
      name: req.body.name,
      keyPrefix: prefix,
      keyHash,
      layer: req.body.layer,
      permissions: req.body.permissions,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      createdBy: req.user!.id,
    }).returning();

    // Return the full key only once on creation
    res.status(201).json({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      fullKey: rawKey,
      layer: key.layer,
      permissions: key.permissions,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(updateKeySchema), async (req, res, next) => {
  try {
    const [key] = await db.update(apiKeys)
      .set(req.body)
      .where(eq(apiKeys.id, req.params.id as string))
      .returning();
    if (!key) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API key not found' } });
      return;
    }
    const { keyHash, ...safe } = key;
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.delete(apiKeys).where(eq(apiKeys.id, req.params.id as string));
    res.json({ message: 'API key revoked' });
  } catch (err) {
    next(err);
  }
});

export { router as apiKeyRouter };
