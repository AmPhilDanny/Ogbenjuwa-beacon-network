import { pgTable, uuid, text, jsonb, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteName: text('site_name').notNull().default('Ogbenjuwa'),
  tagline: text('tagline').default('Community Security & Safety Platform'),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: text('primary_color').default('#1e40af'),
  secondaryColor: text('secondary_color').default('#64748b'),
  accentColor: text('accent_color').default('#f59e0b'),
  fontFamily: text('font_family').default('Inter, sans-serif'),
  emailContact: text('email_contact'),
  phoneContact: text('phone_contact'),
  address: text('address'),
  socialLinks: jsonb('social_links').default({}).notNull(),
  // Hero section content
  heroHeading: text('hero_heading').default('Community Security & Safety Network'),
  heroSubheading: text('hero_subheading').default('Warriors protecting the Idoma Region'),
  heroDescription: text('hero_description').default('An early-warning and emergency response platform for the Idoma Region, Benue State. Sub-2-minute alerting across 9 LGAs — no smartphone required.'),
  heroCtaText: text('hero_cta_text').default('Live Demo'),
  heroCtaLink: text('hero_cta_link').default('/login'),
  heroSecondaryCtaText: text('hero_secondary_cta_text').default('Patrol Map'),
  heroSecondaryCtaLink: text('hero_secondary_cta_link').default('/patrol'),
  // Meta tags
  metaDescription: text('meta_description').default('Ogbenjuwa Community Safety Network — Warriors protecting the Idoma Region, Benue State, Nigeria. Early warning and emergency response platform.'),
  metaKeywords: text('meta_keywords').default('Ogbenjuwa, community safety, Idoma, Benue, Nigeria, emergency alert, vigilante, patrol'),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  ogImage: text('og_image'),
  // Footer content
  footerText: text('footer_text').default('Warriors protecting the Idoma Region, Benue State, Nigeria.'),
  // Maintenance
  maintenanceMode: boolean('maintenance_mode').default(false).notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewSiteSetting = typeof siteSettings.$inferInsert;
