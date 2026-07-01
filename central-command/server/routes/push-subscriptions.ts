import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { pushSubscriptions } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userAgent: z.string().optional(),
});

router.use(authenticate);

// Save or update push subscription
router.post('/', validate(subscribeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await db.select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, req.body.endpoint))
      .limit(1);

    if (existing.length > 0) {
      // Update existing subscription
      const [updated] = await db.update(pushSubscriptions)
        .set({
          keys: req.body.keys,
          userAgent: req.body.userAgent || null,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.id, existing[0].id))
        .returning();

      res.json(updated);
      return;
    }

    // Create new subscription
    const [sub] = await db.insert(pushSubscriptions).values({
      userId: req.user!.id,
      endpoint: req.body.endpoint,
      keys: req.body.keys,
      userAgent: req.body.userAgent || null,
    }).returning();

    res.status(201).json(sub);
  } catch (err) {
    next(err);
  }
});

// Remove subscription
router.delete('/:endpoint', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const endpoint = Buffer.from(req.params.endpoint, 'base64').toString('utf-8');
    await db.delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export { router as pushSubscriptionRouter };
