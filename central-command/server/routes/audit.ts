import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import db from '../config/db.js';
import { auditLogs } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('super_admin'));

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const action = req.query.action as string;
    const resource = req.query.resource as string;
    const userId = req.query.userId as string;

    let query = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));

    if (action) query = query.where(eq(auditLogs.action, action)) as typeof query;
    if (resource) query = query.where(eq(auditLogs.resource, resource)) as typeof query;
    if (userId) query = query.where(eq(auditLogs.userId, userId)) as typeof query;

    const all = await query.limit(limit).offset(offset);
    res.json({ data: all, pagination: { page, limit, offset } });
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
