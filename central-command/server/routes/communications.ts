import { Router } from 'express';
import { z } from 'zod';
import { eq, desc, and } from 'drizzle-orm';
import db from '../config/db.js';
import { announcements, messages, notifications } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole, requirePermission } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// ─── Zod Schemas ──────────────────────────────────────────────────────────

const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  lgaId: z.string().uuid().optional(),
  targetRole: z.string().optional(),
});

const updateAnnouncementSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
});

const sendMessageSchema = z.object({
  receiverId: z.string().uuid(),
  subject: z.string().min(1),
  body: z.string().min(1),
});

router.use(authenticate);

// ─── Announcements ────────────────────────────────────────────────────────

router.get('/announcements', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const isPublic = req.query.isPublic === 'true';

    let query = db.select().from(announcements)
      .orderBy(desc(announcements.createdAt))
      .limit(limit)
      .offset(offset);

    if (isPublic) {
      query = query.where(eq(announcements.isPublished, true)) as typeof query;
    }

    const all = await query;
    res.json({ data: all, pagination: { page, limit, offset } });
  } catch (err) {
    next(err);
  }
});

router.post('/announcements', requirePermission('communications', 'create'), validate(createAnnouncementSchema), async (req, res, next) => {
  try {
    const [announcement] = await db.insert(announcements).values({
      ...req.body,
      createdBy: req.user!.id,
    }).returning();
    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
});

router.put('/announcements/:id', requirePermission('communications', 'update'), validate(updateAnnouncementSchema), async (req, res, next) => {
  try {
    const updates: Record<string, unknown> = { ...req.body, updatedAt: new Date() };
    if (req.body.isPublished === true) {
      updates.publishedAt = new Date();
    }
    const [announcement] = await db.update(announcements)
      .set(updates)
      .where(eq(announcements.id, req.params.id as string))
      .returning();
    if (!announcement) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Announcement not found' } });
      return;
    }
    res.json(announcement);
  } catch (err) {
    next(err);
  }
});

router.delete('/announcements/:id', requireRole('super_admin'), async (req, res, next) => {
  try {
    await db.delete(announcements).where(eq(announcements.id, req.params.id as string));
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
});

// ─── Messages ─────────────────────────────────────────────────────────────

router.get('/messages', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const folder = req.query.folder as string || 'inbox';

    let query = db.select().from(messages).orderBy(desc(messages.createdAt));

    if (folder === 'inbox') {
      query = query.where(eq(messages.receiverId, userId)) as typeof query;
    } else if (folder === 'sent') {
      query = query.where(eq(messages.senderId, userId)) as typeof query;
    }

    const all = await query;
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.post('/messages', validate(sendMessageSchema), async (req, res, next) => {
  try {
    const [message] = await db.insert(messages).values({
      ...req.body,
      senderId: req.user!.id,
    }).returning();
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

router.put('/messages/:id/read', async (req, res, next) => {
  try {
    const [message] = await db.update(messages)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
        eq(messages.id, req.params.id as string),
        eq(messages.receiverId, req.user!.id),
      ))
      .returning();
    if (!message) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Message not found' } });
      return;
    }
    res.json(message);
  } catch (err) {
    next(err);
  }
});

// ─── Notifications ────────────────────────────────────────────────────────

router.get('/notifications', async (req, res, next) => {
  try {
    const all = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, req.user!.id))
      .orderBy(desc(notifications.createdAt));
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.put('/notifications/:id/read', async (req, res, next) => {
  try {
    const [notification] = await db.update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.id, req.params.id as string),
        eq(notifications.userId, req.user!.id),
      ))
      .returning();
    if (!notification) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
      return;
    }
    res.json(notification);
  } catch (err) {
    next(err);
  }
});

export { router as communicationsRouter };
