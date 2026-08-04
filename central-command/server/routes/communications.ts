import { Router } from 'express';
import { z } from 'zod';
import { eq, desc, and, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import db from '../config/db.js';
import { announcements, messages, notifications, users } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { broadcast, sendToUser } from '../ws/index.js';

const router = Router();

// ─── Zod Schemas ──────────────────────────────────────────────────────────

const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  lgaId: z.string().uuid().optional(),
  targetRole: z.string().optional(),
  isPublished: z.boolean().optional(),
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

const announcementColumns = {
  id: announcements.id,
  title: announcements.title,
  body: announcements.body,
  lgaId: announcements.lgaId,
  targetRole: announcements.targetRole,
  createdBy: announcements.createdBy,
  creatorName: users.name,
  isPublished: announcements.isPublished,
  publishedAt: announcements.publishedAt,
  createdAt: announcements.createdAt,
  updatedAt: announcements.updatedAt,
};

const recipientCount = sql<number>`(
  SELECT COUNT(*)::int FROM notifications n
  WHERE n.resource_type = 'announcement' AND n.resource_id = ${announcements.id}::text
)`;

// ─── Public (no auth) ──────────────────────────────────────────────────────

// Published announcements — the public broadcast feed
router.get('/announcements/public', async (_req, res, next) => {
  try {
    const all = await db.select({ ...announcementColumns, recipientCount })
      .from(announcements)
      .leftJoin(users, eq(users.id, announcements.createdBy))
      .where(eq(announcements.isPublished, true))
      .orderBy(desc(announcements.createdAt))
      .limit(50);
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.use(authenticate);

// ─── Announcements (broadcasts) ───────────────────────────────────────────

router.get('/announcements', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const isPublic = req.query.isPublic === 'true';

    let query = db.select({ ...announcementColumns, recipientCount })
      .from(announcements)
      .leftJoin(users, eq(users.id, announcements.createdBy))
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

router.post('/announcements', requireRole('super_admin', 'state_observer', 'lga_coordinator'), validate(createAnnouncementSchema), async (req, res, next) => {
  try {
    const [announcement] = await db.insert(announcements).values({
      ...req.body,
      createdBy: req.user!.id,
    }).returning();

    let recipients = 0;
    if (announcement.isPublished) {
      recipients = await fanOutAnnouncement(announcement);
      broadcast('announcement:new', { ...announcement, recipientCount: recipients });
    }

    res.status(201).json({ ...announcement, recipientCount: recipients });
  } catch (err) {
    next(err);
  }
});

router.put('/announcements/:id', requireRole('super_admin', 'state_observer', 'lga_coordinator'), validate(updateAnnouncementSchema), async (req, res, next) => {
  try {
    const [existing] = await db.select().from(announcements).where(eq(announcements.id, req.params.id as string));
    if (!existing) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Announcement not found' } });
      return;
    }

    const updates: Record<string, unknown> = { ...req.body, updatedAt: new Date() };
    if (req.body.isPublished === true) {
      updates.publishedAt = new Date();
    }

    const [announcement] = await db.update(announcements)
      .set(updates)
      .where(eq(announcements.id, req.params.id as string))
      .returning();

    // Transition draft → published: fan out to all active users + live push
    let recipients = 0;
    if (!existing.isPublished && announcement.isPublished) {
      recipients = await fanOutAnnouncement(announcement);
      broadcast('announcement:new', { ...announcement, recipientCount: recipients });
    }

    res.json({ ...announcement, recipientCount: recipients });
  } catch (err) {
    next(err);
  }
});

router.delete('/announcements/:id', requireRole('super_admin'), async (req, res, next) => {
  try {
    await db.delete(announcements).where(eq(announcements.id, req.params.id as string));
    // Clean up the fan-out notifications for this broadcast
    await db.delete(notifications).where(and(
      eq(notifications.resourceType, 'announcement'),
      eq(notifications.resourceId, req.params.id as string),
    ));
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    next(err);
  }
});

// ─── Messages (command-centre only for sending) ───────────────────────────

router.get('/messages', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const folder = req.query.folder as string || 'all';

    const sender = alias(users, 'sender');
    const receiver = alias(users, 'receiver');

    let query = db.select({
      id: messages.id,
      senderId: messages.senderId,
      senderName: sender.name,
      senderRole: sender.role,
      receiverId: messages.receiverId,
      receiverName: receiver.name,
      receiverRole: receiver.role,
      subject: messages.subject,
      body: messages.body,
      isRead: messages.isRead,
      readAt: messages.readAt,
      createdAt: messages.createdAt,
    })
      .from(messages)
      .leftJoin(sender, eq(sender.id, messages.senderId))
      .leftJoin(receiver, eq(receiver.id, messages.receiverId))
      .orderBy(desc(messages.createdAt));

    if (folder === 'inbox') {
      query = query.where(eq(messages.receiverId, userId)) as typeof query;
    } else if (folder === 'sent') {
      query = query.where(eq(messages.senderId, userId)) as typeof query;
    } else {
      query = query.where(or(eq(messages.receiverId, userId), eq(messages.senderId, userId))) as typeof query;
    }

    const all = await query;
    res.json({ data: all });
  } catch (err) {
    next(err);
  }
});

router.post('/messages', requireRole('super_admin', 'state_observer', 'lga_coordinator'), validate(sendMessageSchema), async (req, res, next) => {
  try {
    const [message] = await db.insert(messages).values({
      ...req.body,
      senderId: req.user!.id,
    }).returning();

    // Deliver to the receiver: in-app notification + live WS push
    try {
      await db.insert(notifications).values({
        userId: message.receiverId,
        type: 'message',
        title: message.subject,
        body: message.body,
        resourceType: 'message',
        resourceId: message.id,
      }).execute();
      sendToUser(message.receiverId, 'message:new', message);
    } catch {
      // Notification insert is non-critical — don't fail the request
    }

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

// Own notifications (user-facing inbox)
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

// Full platform log — command centre tracks every notification ever sent
router.get('/notifications/all', requireRole('super_admin', 'state_observer', 'lga_coordinator'), async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const type = req.query.type as string | undefined;

    let query = db.select({
      id: notifications.id,
      userId: notifications.userId,
      userName: users.name,
      userEmail: users.email,
      userRole: users.role,
      type: notifications.type,
      title: notifications.title,
      body: notifications.body,
      resourceType: notifications.resourceType,
      resourceId: notifications.resourceId,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
    })
      .from(notifications)
      .leftJoin(users, eq(users.id, notifications.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    if (type) {
      query = query.where(eq(notifications.type, type)) as typeof query;
    }

    const all = await query;
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

// ─── Helpers ──────────────────────────────────────────────────────────────

async function fanOutAnnouncement(announcement: { id: string; title: string; body: string }): Promise<number> {
  const targetUsers = await db.select({ id: users.id }).from(users).where(eq(users.isActive, true));
  if (targetUsers.length === 0) return 0;

  await db.insert(notifications).values(
    targetUsers.map((u) => ({
      userId: u.id,
      type: 'announcement',
      title: announcement.title,
      body: announcement.body,
      resourceType: 'announcement',
      resourceId: announcement.id,
    })),
  ).execute();

  return targetUsers.length;
}

export { router as communicationsRouter };
