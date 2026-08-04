import { Router } from 'express';
import { eq, desc, and, gte, lte, count } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import db from '../config/db.js';
import { auditLogs, users } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('super_admin'));

const actor = alias(users, 'actor');

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const action = req.query.action as string | undefined;
    const resource = req.query.resource as string | undefined;
    const userId = req.query.userId as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    const conds: any[] = [];
    if (action) conds.push(eq(auditLogs.action, action));
    if (resource) conds.push(eq(auditLogs.resource, resource));
    if (userId) conds.push(eq(auditLogs.userId, userId));
    if (dateFrom) conds.push(gte(auditLogs.createdAt, new Date(`${dateFrom}T00:00:00`)));
    if (dateTo) conds.push(lte(auditLogs.createdAt, new Date(`${dateTo}T23:59:59`)));
    const where = conds.length ? and(...conds) : undefined;

    const [totalRow] = where
      ? await db.select({ total: count() }).from(auditLogs).where(where)
      : await db.select({ total: count() }).from(auditLogs);

    let query = db.select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      userName: actor.name,
      userRole: actor.role,
      action: auditLogs.action,
      resource: auditLogs.resource,
      resourceId: auditLogs.resourceId,
      details: auditLogs.details,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
    })
      .from(auditLogs)
      .leftJoin(actor, eq(actor.id, auditLogs.userId))
      .orderBy(desc(auditLogs.createdAt));

    if (where) query = query.where(where) as typeof query;
    const all = await query.limit(limit).offset(offset);

    res.json({ data: all, pagination: { page, limit, offset, total: totalRow.total } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [log] = await db.select().from(auditLogs).where(eq(auditLogs.id, req.params.id as string));
    if (!log) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Audit log not found' } });
      return;
    }
    res.json(log);
  } catch (err) {
    next(err);
  }
});

export { router as auditRouter };
