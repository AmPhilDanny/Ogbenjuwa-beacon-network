const API_BASE = 'http://localhost:4001/api/v1';

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
  footerText?: string;
}

let cached: SiteSettings | null = null;

function applyCSSVars(s: SiteSettings) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', s.primaryColor);
  root.style.setProperty('--brand-secondary', s.secondaryColor);
  root.style.setProperty('--brand-accent', s.accentColor);
  root.style.setProperty('--brand-font', s.fontFamily);
  document.title = s.siteName + (s.tagline ? ` — ${s.tagline}` : '');
  if (s.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = s.faviconUrl;
  }
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', s.primaryColor);
  // Meta tags
  if (s.metaDescription) { setMeta('description', s.metaDescription); }
  if (s.metaKeywords) { setMeta('keywords', s.metaKeywords); }
  if (s.ogTitle) { setMeta('og:title', s.ogTitle, 'property'); }
  if (s.ogDescription) { setMeta('og:description', s.ogDescription, 'property'); }
  if (s.ogImage) { setMeta('og:image', s.ogImage, 'property'); }
  if (s.siteName) { setMeta('og:site_name', s.siteName, 'property'); }
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, name);
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
    const fallback: SiteSettings = {
      siteName: 'Ogbenjuwa',
      tagline: 'Citizen Portal',
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
