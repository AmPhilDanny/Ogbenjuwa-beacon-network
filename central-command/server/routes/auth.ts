import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { users, sessions } from '../db/schema/index.js';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rate-limit.js';

const authRateLimit = rateLimit({ windowMs: 60_000, maxRequests: 10, keyGenerator: (req) => `auth:${req.ip || 'unknown'}` });

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const phoneLoginSchema = z.object({
  phone: z.string().min(1),
  otp: z.string().length(6),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

function generateTokens(user: { id: string; email: string; role: string; lgaId?: string | null }) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, lgaId: user.lgaId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any },
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any },
  );

  return { accessToken, refreshToken };
}

router.post('/login', authRateLimit, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: { code: 'ACCOUNT_DISABLED', message: 'Account has been disabled' } });
      return;
    }

    const tokens = generateTokens(user);

    await db.insert(sessions).values({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      deviceInfo: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lgaId: user.lgaId,
        avatar: user.avatar,
      },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    let payload: { id: string };
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
    } catch {
      res.status(401).json({ error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' } });
      return;
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshToken, refreshToken));

    if (!session) {
      res.status(401).json({ error: { code: 'SESSION_NOT_FOUND', message: 'Refresh session not found' } });
      return;
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.id));
    if (!user || !user.isActive) {
      res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found or inactive' } });
      return;
    }

    const tokens = generateTokens(user);

    await db.delete(sessions).where(eq(sessions.id, session.id));
    await db.insert(sessions).values({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      deviceInfo: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json(tokens);
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.delete(sessions).where(eq(sessions.refreshToken, refreshToken));
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));
    if (!user) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      lgaId: user.lgaId,
      wardId: user.wardId,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/phone-login — phone + OTP login for beacon-network & user-apps
router.post('/phone-login', authRateLimit, validate(phoneLoginSchema), async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    // Normalise phone: remove spaces, ensure + prefix
    const normalised = phone.trim().replace(/\s+/g, '');
    const fullPhone = normalised.startsWith('+') ? normalised : `+${normalised}`;

    const [result] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      lgaId: users.lgaId,
      wardId: users.wardId,
      phone: users.phone,
      isActive: users.isActive,
      lga: lgas.name,
      ward: wards.name,
    })
      .from(users)
      .leftJoin(lgas, eq(users.lgaId, lgas.id))
      .leftJoin(wards, eq(users.wardId, wards.id))
      .where(eq(users.phone, fullPhone));

    if (!result) {
      res.status(401).json({ error: { code: 'PHONE_NOT_FOUND', message: 'No account found with this phone number' } });
      return;
    }

    if (!result.isActive) {
      res.status(403).json({ error: { code: 'ACCOUNT_DISABLED', message: 'Account has been disabled' } });
      return;
    }

    // Simulation mode: any 6-digit OTP is accepted
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      res.status(401).json({ error: { code: 'INVALID_OTP', message: 'Invalid OTP format' } });
      return;
    }

    const tokens = generateTokens(result);

    await db.insert(sessions).values({
      userId: result.id,
      refreshToken: tokens.refreshToken,
      deviceInfo: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        lga: result.lga || '',
        lgaId: result.lgaId,
        ward: result.ward || '',
        wardId: result.wardId,
        phone: result.phone,
      },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
