import { API_BASE } from './api-config';

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  emailContact?: string;
  phoneContact?: string;
  address?: string;
  socialLinks?: Record<string, string>;
  // Hero
  heroHeading?: string;
  heroSubheading?: string;
  heroDescription?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  // Meta
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  // Footer
  footerText?: string;
}

let cached: SiteSettings | null = null;

function applyCSSVars(s: SiteSettings) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', s.primaryColor);
  root.style.setProperty('--brand-secondary', s.secondaryColor);
  root.style.setProperty('--brand-accent', s.accentColor);
  root.style.setProperty('--brand-font', s.fontFamily);
  // Update document title
  document.title = s.siteName + (s.tagline ? ` — ${s.tagline}` : '');
  // Update favicon
  if (s.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = s.faviconUrl;
  }
  // Theme color meta
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', s.primaryColor);
  // Meta description
  if (s.metaDescription) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = s.metaDescription;
  }
  // Meta keywords
  if (s.metaKeywords) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'keywords'; document.head.appendChild(meta); }
    meta.content = s.metaKeywords;
  }
  // Open Graph
  if (s.ogTitle) { setMeta('og:title', s.ogTitle); }
  if (s.ogDescription) { setMeta('og:description', s.ogDescription); }
  if (s.ogImage) { setMeta('og:image', s.ogImage); }
  if (s.siteName) { setMeta('og:site_name', s.siteName); }
}

function setMeta(property: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

export async function loadSiteSettings(): Promise<SiteSettings> {
  if (cached) return cached;
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    const data: SiteSettings = await res.json();
    cached = data;
    applyCSSVars(data);
    return data;
  } catch {
    // Fallback defaults
    const fallback: SiteSettings = {
      siteName: 'Ogbenjuwa',
      tagline: 'Community Safety Network',
      logoUrl: null,
      faviconUrl: null,
      primaryColor: '#1e40af',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      fontFamily: 'Inter, sans-serif',
    };
    cached = fallback;
    applyCSSVars(fallback);
    return fallback;
  }
}

export function getSiteSettings(): SiteSettings | null {
  return cached;
}
