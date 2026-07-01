import { Router } from 'express';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import db from '../config/db.js';
import { smsLogs } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const simulateSchema = z.object({
  alertId: z.string().uuid().optional(),
  mode: z.enum(['sms', 'ussd']).default('sms'),
  recipientPhones: z.array(z.string()).min(1).optional(),
  message: z.string().optional(),
});

// Simulate SMS broadcast
router.post('/simulate', authenticate, requireRole('super_admin', 'lga_coordinator'), validate(simulateSchema), async (req, res, next) => {
  try {
    const { alertId, mode, recipientPhones, message } = req.body;

    // Simulate staggered delivery
    const contacts = recipientPhones || ['+2348034412290', '+2348123456789', '+2348065432109'];
    const msg = message || 'OGBENJUWA ALERT: Test emergency broadcast message.';

    const logEntries = [];
    for (const phone of contacts) {
      const delay = 200 + Math.random() * 300; // 200-500ms
      await new Promise(resolve => setTimeout(resolve, Math.min(delay, 50))); // capped for perf

      const status = Math.random() > 0.1 ? 'delivered' : 'failed'; // 90% delivery rate

      const [log] = await db.insert(smsLogs).values({
        alertId: alertId || null,
        recipientPhone: phone,
        message: msg,
        status,
        sentAt: new Date(),
        deliveredAt: status === 'delivered' ? new Date() : null,
      }).returning();

      logEntries.push(log);
    }

    if (mode === 'ussd') {
      // Return USSD-style response
      res.json({
        mode: 'ussd',
        sessionId: Math.random().toString(36).substring(7),
        message: 'OGBENJUWA ALERT SYSTEM\n1. Send Alert\n2. Check Status\n3. Contact Patrol\n4. Emergency SOS',
        step: 1,
        logs: logEntries,
      });
      return;
    }

    res.json({
      mode: 'sms',
      delivered: logEntries.filter(l => l.status === 'delivered').length,
      failed: logEntries.filter(l => l.status === 'failed').length,
      total: logEntries.length,
      logs: logEntries,
    });
  } catch (err) {
    next(err);
  }
});

// Get SMS logs
router.get('/logs', authenticate, requireRole('super_admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const all = await db.select()
      .from(smsLogs)
      .orderBy(desc(smsLogs.sentAt))
      .limit(limit)
      .offset(offset);

    res.json({ data: all, pagination: { page, limit, offset } });
  } catch (err) {
    next(err);
  }
});

export { router as smsRouter };
