import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';
import crypto from 'crypto';
import db from '../config/db.js';
import { users, sessions } from '../db/schema/index.js';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rate-limit.js';

const authRateLimit = rateLimit({ windowMs: 60_000, maxRequests: 10, keyGenerator: (req) => `auth:${req.ip || 'unknown'}` });

const router = Router();

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

const otpSchema = z.object({
  phone: z.string().min(1),
  otp: z.string().length(6),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const ADMIN_ROLES = ['super_admin', 'state_observer', 'lga_coordinator', 'vigilante_leader', 'community_admin'];

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

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isAdmin(role: string): boolean {
  return ADMIN_ROLES.includes(role);
}

// POST /auth/login — email/username + password, returns tokens or requires OTP
router.post('/login', authRateLimit, validate(loginSchema), async (req, res, next) => {
  try {
    const { login, password } = req.body;

    const [user] = await db.select().from(users).where(
      or(eq(users.email, login), eq(users.username!, login))
    );
    if (!user) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid login or password' } });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid login or password' } });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: { code: 'ACCOUNT_DISABLED', message: 'Account has been disabled' } });
      return;
    }

    // Residents & regular users: direct token response
    if (!isAdmin(user.role)) {
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
      return;
    }

    // Admins & super_admin: require OTP verification
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.update(users)
      .set({ otpCode: otp, otpExpiresAt })
      .where(eq(users.id, user.id));

    // In dev mode, log OTP to console for testing
    console.log(`[OTP] ${user.name} (${user.role}): ${otp}`);

    res.json({
      requiresOtp: true,
      phone: user.phone || '',
      message: 'OTP sent to your registered phone number',
    });
  } catch (err) {
    console.error('[AUTH DEBUG] Login error:', err);
    if (err instanceof Error) {
      console.error('[AUTH DEBUG] Stack:', err.stack);
      console.error('[AUTH DEBUG] Message:', err.message);
    }
    next(err);
  }
});

// POST /auth/verify-otp — verify OTP and return tokens (admin flow)
router.post('/verify-otp', authRateLimit, validate(otpSchema), async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const normalised = phone.trim().replace(/\s+/g, '');
    const fullPhone = normalised.startsWith('+') ? normalised : `+${normalised}`;

    const [user] = await db.select().from(users).where(eq(users.phone, fullPhone));
    if (!user) {
      res.status(401).json({ error: { code: 'PHONE_NOT_FOUND', message: 'No account found with this phone number' } });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: { code: 'ACCOUNT_DISABLED', message: 'Account has been disabled' } });
      return;
    }

    // Dev mode: any 6-digit OTP accepted; prod mode: verify stored OTP
    const isValidOtp = import.meta.env.PROD
      ? (user.otpCode === otp && user.otpExpiresAt && new Date() < user.otpExpiresAt)
      : /^\d{6}$/.test(otp);

    if (!isValidOtp) {
      res.status(401).json({ error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP' } });
      return;
    }

    // Clear OTP
    await db.update(users)
      .set({ otpCode: null, otpExpiresAt: null })
      .where(eq(users.id, user.id));

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

// POST /auth/phone-login — phone + OTP login (legacy, redirects to verify-otp)
router.post('/phone-login', authRateLimit, validate(otpSchema), async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const normalised = phone.trim().replace(/\s+/g, '');
    const fullPhone = normalised.startsWith('+') ? normalised : `+${normalised}`;

    const [user] = await db.select().from(users).where(eq(users.phone, fullPhone));
    if (!user) {
      res.status(401).json({ error: { code: 'PHONE_NOT_FOUND', message: 'No account found with this phone number' } });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: { code: 'ACCOUNT_DISABLED', message: 'Account has been disabled' } });
      return;
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      res.status(401).json({ error: { code: 'INVALID_OTP', message: 'Invalid OTP format' } });
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

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, lgaId: user.lgaId, avatar: user.avatar }, ...tokens });
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
      username: user.username,
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

export { router as authRouter };
