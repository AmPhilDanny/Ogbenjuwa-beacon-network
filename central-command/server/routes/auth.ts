import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';
import db from '../config/db.js';
import { users, sessions, lgas, wards, villages } from '../db/schema/index.js';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { recordAudit } from '../lib/audit.js';
import { roleLabel } from '../lib/role-permissions.js';

const authRateLimit = rateLimit({ windowMs: 60_000, maxRequests: 10, keyGenerator: (req) => `auth:${req.ip || 'unknown'}` });

const router = Router();

const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

// ─── 2FA (OTP) DISABLED ───────────────────────────────────────────────
// Two-Factor Authentication via OTP has been disabled across the platform.
// To re-enable:
//   1. Uncomment otpSchema, generateOtp, the OTP branch in POST /auth/login,
//      the POST /auth/verify-otp route and the POST /auth/phone-login route.
//   2. Restore the OTP verification UIs in central-command/admin, 
//      ogbenjuwa-beacon-network and user-apps (see "2FA (OTP) DISABLED"
//      notes in their useAuth hooks / Login pages).
// const otpSchema = z.object({
//   phone: z.string().min(1),
//   otp: z.string().length(6),
// });

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

function isAdmin(role: string): boolean {
  return ADMIN_ROLES.includes(role);
}

async function buildUserPayload(user: {
  id: string; email: string; name: string; role: string; username?: string | null;
  phone?: string | null; lgaId?: string | null; wardId?: string | null; villageId?: string | null;
  avatar?: string | null; lastLoginAt?: Date | null;
}) {
  const [lga, ward, village] = await Promise.all([
    user.lgaId ? db.select({ name: lgas.name }).from(lgas).where(eq(lgas.id, user.lgaId)).limit(1) : [],
    user.wardId ? db.select({ name: wards.name }).from(wards).where(eq(wards.id, user.wardId)).limit(1) : [],
    user.villageId ? db.select({ name: villages.name }).from(villages).where(eq(villages.id, user.villageId)).limit(1) : [],
  ]);
  return {
    id: user.id,
    email: user.email,
    username: user.username ?? undefined,
    name: user.name,
    phone: user.phone ?? undefined,
    role: user.role,
    roleLabel: await roleLabel(user.role),
    lgaId: user.lgaId ?? undefined,
    wardId: user.wardId ?? undefined,
    villageId: user.villageId ?? undefined,
    lga: lga[0]?.name ?? undefined,
    ward: ward[0]?.name ?? undefined,
    village: village[0]?.name ?? undefined,
    avatar: user.avatar ?? undefined,
    lastLoginAt: user.lastLoginAt ?? undefined,
  };
}

// 2FA (OTP) DISABLED — see note above. OTP generation helper removed:
// function generateOtp(): string {
//   return String(Math.floor(100000 + Math.random() * 900000));
// }

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

    await recordAudit({
      userId: user.id,
      action: 'LOGIN',
      resource: 'auth',
      details: { role: user.role },
      ipAddress: req.ip || null,
    });

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
        user: await buildUserPayload(user),
        ...tokens,
      });
      return;
    }

    // 2FA (OTP) DISABLED — admins now receive tokens directly, same as residents.
    // Previously: generated an OTP, stored it on the user row, and responded
    // with requiresOtp so the client could call /auth/verify-otp.
    const tokens = generateTokens(user);
    await db.insert(sessions).values({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      deviceInfo: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      user: await buildUserPayload(user),
      ...tokens,
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

// 2FA (OTP) DISABLED — OTP verification endpoint. See note at top of file.
// router.post('/verify-otp', authRateLimit, validate(otpSchema), async (req, res, next) => {
//   try {
//     const { phone, otp } = req.body;
//
//     const normalised = phone.trim().replace(/\s+/g, '');
//     const fullPhone = normalised.startsWith('+') ? normalised : `+${normalised}`;
//
//     const [user] = await db.select().from(users).where(eq(users.phone, fullPhone));
//     if (!user) {
//       res.status(401).json({ error: { code: 'PHONE_NOT_FOUND', message: 'No account found with this phone number' } });
//       return;
//     }
//
//     if (!user.isActive) {
//       res.status(403).json({ error: { code: 'ACCOUNT_DISABLED', message: 'Account has been disabled' } });
//       return;
//     }
//
//     const isValidOtp = env.NODE_ENV === 'production'
//       ? (user.otpCode === otp && user.otpExpiresAt && new Date() < user.otpExpiresAt)
//       : /^\d{6}$/.test(otp);
//
//     if (!isValidOtp) {
//       res.status(401).json({ error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP' } });
//       return;
//     }
//
//     await db.update(users)
//       .set({ otpCode: null, otpExpiresAt: null })
//       .where(eq(users.id, user.id));
//
//     const tokens = generateTokens(user);
//
//     await db.insert(sessions).values({
//       userId: user.id,
//       refreshToken: tokens.refreshToken,
//       deviceInfo: req.headers['user-agent'] || null,
//       ipAddress: req.ip || null,
//       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//     });
//
//     res.json({
//       user: {
//         id: user.id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         lgaId: user.lgaId,
//         avatar: user.avatar,
//       },
//       ...tokens,
//     });
//   } catch (err) {
//     next(err);
//   }
// });

// 2FA (OTP) DISABLED — legacy phone-login endpoint. See note at top of file.
// router.post('/phone-login', authRateLimit, validate(otpSchema), async (req, res, next) => {
//   try {
//     const { phone, otp } = req.body;
//
//     const normalised = phone.trim().replace(/\s+/g, '');
//     const fullPhone = normalised.startsWith('+') ? normalised : `+${normalised}`;
//
//     const [user] = await db.select().from(users).where(eq(users.phone, fullPhone));
//     if (!user) {
//       res.status(401).json({ error: { code: 'PHONE_NOT_FOUND', message: 'No account found with this phone number' } });
//       return;
//     }
//
//     if (!user.isActive) {
//       res.status(403).json({ error: { code: 'ACCOUNT_DISABLED', message: 'Account has been disabled' } });
//       return;
//     }
//
//     if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
//       res.status(401).json({ error: { code: 'INVALID_OTP', message: 'Invalid OTP format' } });
//       return;
//     }
//
//     const tokens = generateTokens(user);
//
//     await db.insert(sessions).values({
//       userId: user.id,
//       refreshToken: tokens.refreshToken,
//       deviceInfo: req.headers['user-agent'] || null,
//       ipAddress: req.ip || null,
//       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//     });
//
//     res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, lgaId: user.lgaId, avatar: user.avatar }, ...tokens });
//   } catch (err) {
//     next(err);
//   }
// });

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
    res.json(await buildUserPayload(user));
  } catch (err) {
    next(err);
  }
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional().nullable(),
  lgaId: z.string().uuid().optional().nullable(),
  wardId: z.string().uuid().optional().nullable(),
  villageId: z.string().uuid().optional().nullable(),
  avatar: z.string().max(500).optional().nullable(),
});

// PATCH /auth/me — residents/any authenticated user edits their own profile
router.patch('/me', authenticate, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));
    if (!user) {
      res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      return;
    }

    const updates: Record<string, unknown> = {};
    for (const key of ['name', 'phone', 'lgaId', 'wardId', 'villageId', 'avatar'] as const) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key] ?? null;
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, user.id));
    }

    const [updated] = await db.select().from(users).where(eq(users.id, user.id));
    res.json(await buildUserPayload(updated));
  } catch (err) {
    next(err);
  }
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().optional(),
  lgaId: z.string().uuid().optional(),
});

// POST /auth/register — self-registration for residents
router.post('/register', rateLimit({ windowMs: 60_000, maxRequests: 3 }), validate(registerSchema), async (req, res, next) => {
  try {
    const { email, username, password, name, phone, lgaId } = req.body;

    const existing = await db.select().from(users).where(
      or(eq(users.email, email), eq(users.username!, username))
    );
    if (existing.length > 0) {
      res.status(409).json({ error: { code: 'ACCOUNT_EXISTS', message: 'An account with this email or username already exists' } });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(users).values({
      email,
      username,
      passwordHash,
      name,
      phone: phone || null,
      role: 'resident',
      lgaId: lgaId || null,
      isActive: true,
    }).returning();

    const tokens = generateTokens(user);
    await db.insert(sessions).values({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      user: await buildUserPayload(user),
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
