import { Router } from 'express';
import { z } from 'zod';
import { eq, desc, and, sql } from 'drizzle-orm';
import db from '../config/db.js';
import { feedAcknowledgements, feedComments, users } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const RESOURCE_TYPES = ['alert', 'announcement'] as const;

const resourceSchema = z.object({
  resourceType: z.enum(RESOURCE_TYPES),
  resourceId: z.string().uuid(),
});

const createCommentSchema = resourceSchema.extend({
  body: z.string().min(1).max(1000),
});

router.use(authenticate);

// Batch interactions for the whole feed — counts, my acks, and all comments
router.get('/interactions', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const ackRows = await db.select({
      resourceType: feedAcknowledgements.resourceType,
      resourceId: feedAcknowledgements.resourceId,
      userId: feedAcknowledgements.userId,
    }).from(feedAcknowledgements);

    const acks: Record<string, { count: number; acknowledged: boolean }> = {};
    const myAcks: Record<string, boolean> = {};
    for (const row of ackRows) {
      const key = `${row.resourceType}:${row.resourceId}`;
      if (!acks[key]) acks[key] = { count: 0, acknowledged: false };
      acks[key].count += 1;
      if (row.userId === userId) {
        acks[key].acknowledged = true;
        myAcks[key] = true;
      }
    }

    const comments = await db.select({
      id: feedComments.id,
      resourceType: feedComments.resourceType,
      resourceId: feedComments.resourceId,
      body: feedComments.body,
      userName: users.name,
      userRole: users.role,
      createdAt: feedComments.createdAt,
    })
      .from(feedComments)
      .leftJoin(users, eq(users.id, feedComments.userId))
      .orderBy(desc(feedComments.createdAt))
      .limit(500);

    res.json({ data: { acks, myAcks, comments } });
  } catch (err) {
    next(err);
  }
});

// Toggle an acknowledgement for the current user on a feed item
router.post('/acknowledge', validate(resourceSchema), async (req, res, next) => {
  try {
    const { resourceType, resourceId } = req.body;
    const userId = req.user!.id;

    const [existing] = await db.select().from(feedAcknowledgements)
      .where(and(
        eq(feedAcknowledgements.userId, userId),
        eq(feedAcknowledgements.resourceType, resourceType),
        eq(feedAcknowledgements.resourceId, resourceId),
      ));

    let acknowledged: boolean;
    if (existing) {
      await db.delete(feedAcknowledgements).where(eq(feedAcknowledgements.id, existing.id));
      acknowledged = false;
    } else {
      await db.insert(feedAcknowledgements).values({ userId, resourceType, resourceId }).execute();
      acknowledged = true;
    }

    const [count] = await db.select({ count: sql<number>`count(*)::int` }).from(feedAcknowledgements)
      .where(and(
        eq(feedAcknowledgements.resourceType, resourceType),
        eq(feedAcknowledgements.resourceId, resourceId),
      ));

    res.json({ acknowledged, count: count.count });
  } catch (err) {
    next(err);
  }
});

// Comments for a single feed item
router.get('/comments', validate(resourceSchema), async (req, res, next) => {
  try {
    const { resourceType, resourceId } = req.query as { resourceType: typeof RESOURCE_TYPES[number]; resourceId: string };
    const comments = await db.select({
      id: feedComments.id,
      resourceType: feedComments.resourceType,
      resourceId: feedComments.resourceId,
      body: feedComments.body,
      userName: users.name,
      userRole: users.role,
      createdAt: feedComments.createdAt,
    })
      .from(feedComments)
      .leftJoin(users, eq(users.id, feedComments.userId))
      .where(and(
        eq(feedComments.resourceType, resourceType),
        eq(feedComments.resourceId, resourceId),
      ))
      .orderBy(desc(feedComments.createdAt));

    res.json({ data: comments });
  } catch (err) {
    next(err);
  }
});

router.post('/comments', validate(createCommentSchema), async (req, res, next) => {
  try {
    const { resourceType, resourceId, body } = req.body;
    const [comment] = await db.insert(feedComments).values({
      userId: req.user!.id,
      resourceType,
      resourceId,
      body,
    }).returning();

    const [withUser] = await db.select({
      id: feedComments.id,
      resourceType: feedComments.resourceType,
      resourceId: feedComments.resourceId,
      body: feedComments.body,
      userName: users.name,
      userRole: users.role,
      createdAt: feedComments.createdAt,
    })
      .from(feedComments)
      .leftJoin(users, eq(users.id, feedComments.userId))
      .where(eq(feedComments.id, comment.id));

    res.status(201).json(withUser);
  } catch (err) {
    next(err);
  }
});

export { router as feedRouter };
