import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '../config/db.js';
import { siteSettings } from '../db/schema/index.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const updateSettingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  tagline: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontFamily: z.string().optional(),
  emailContact: z.string().optional(),
  phoneContact: z.string().optional(),
  address: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
  // Hero content
  heroHeading: z.string().optional(),
  heroSubheading: z.string().optional(),
  heroDescription: z.string().optional(),
  heroCtaText: z.string().optional(),
  heroCtaLink: z.string().optional(),
  heroSecondaryCtaText: z.string().optional(),
  heroSecondaryCtaLink: z.string().optional(),
  // Meta
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  // Footer
  footerText: z.string().optional(),
  // Maintenance
  maintenanceMode: z.boolean().optional(),
});

// Public — no auth required
router.get('/', async (_req, res, next) => {
  try {
    const [settings] = await db.select().from(siteSettings).limit(1);
    if (!settings) {
      res.json({
        siteName: 'Ogbenjuwa',
        tagline: 'Community Security & Safety Platform',
      });
      return;
    }
    // Return only public fields
    res.json({
      siteName: settings.siteName,
      tagline: settings.tagline,
      logoUrl: settings.logoUrl,
      faviconUrl: settings.faviconUrl,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor,
      fontFamily: settings.fontFamily,
      emailContact: settings.emailContact,
      phoneContact: settings.phoneContact,
      address: settings.address,
      socialLinks: settings.socialLinks,
      heroHeading: settings.heroHeading,
      heroSubheading: settings.heroSubheading,
      heroDescription: settings.heroDescription,
      heroCtaText: settings.heroCtaText,
      heroCtaLink: settings.heroCtaLink,
      heroSecondaryCtaText: settings.heroSecondaryCtaText,
      heroSecondaryCtaLink: settings.heroSecondaryCtaLink,
      metaDescription: settings.metaDescription,
      metaKeywords: settings.metaKeywords,
      ogTitle: settings.ogTitle,
      ogDescription: settings.ogDescription,
      ogImage: settings.ogImage,
      footerText: settings.footerText,
    });
  } catch (err) {
    next(err);
  }
});

// Admin — full settings access
router.get('/admin', authenticate, requireRole('super_admin'), async (_req, res, next) => {
  try {
    const [settings] = await db.select().from(siteSettings).limit(1);
    res.json(settings || {});
  } catch (err) {
    next(err);
  }
});

router.put('/', authenticate, requireRole('super_admin'), validate(updateSettingsSchema), async (req, res, next) => {
  try {
    const [existing] = await db.select().from(siteSettings).limit(1);
    if (existing) {
      const [updated] = await db.update(siteSettings)
        .set({ ...req.body, updatedBy: req.user!.id, updatedAt: new Date() })
        .where(eq(siteSettings.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db.insert(siteSettings).values({
        ...req.body,
        updatedBy: req.user!.id,
      }).returning();
      res.status(201).json(created);
    }
  } catch (err) {
    next(err);
  }
});

export { router as siteSettingsRouter };
