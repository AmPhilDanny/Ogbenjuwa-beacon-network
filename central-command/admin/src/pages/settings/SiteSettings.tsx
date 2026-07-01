import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { Save, Upload, Palette, Globe, Link as LinkIcon, Settings, Image, FileText, Search, Layout } from 'lucide-react';

interface SiteSettingData {
  siteName?: string;
  tagline?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  emailContact?: string;
  phoneContact?: string;
  address?: string;
  socialLinks?: Record<string, string>;
  // Hero content
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
  // Maintenance
  maintenanceMode?: boolean;
}

const TABS = [
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'logo', label: 'Logo & Favicon', icon: Image },
  { id: 'hero', label: 'Hero Content', icon: Layout },
  { id: 'meta', label: 'Meta & SEO', icon: Search },
  { id: 'contact', label: 'Contact', icon: Globe },
  { id: 'social', label: 'Social Links', icon: Link },
  { id: 'advanced', label: 'Advanced', icon: Settings },
];

export default function SiteSettings() {
  const { data: settingsData, loading, refetch } = useApi<SiteSettingData>('/settings/admin');
  const [form, setForm] = useState<SiteSettingData>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');

  useEffect(() => {
    if (settingsData) setForm(settingsData);
  }, [settingsData]);

  const handleChange = (field: string, value: any) => {
    setForm(p => ({ ...p, [field]: value }));
    setSaved(false);
  };

  const handleSocialChange = (platform: string, value: string) => {
    const current = form.socialLinks || {};
    handleChange('socialLinks', { ...current, [platform]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', form);
      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage branding, logo, colors, and site-wide configuration</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Site Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Site Name</label>
                  <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.siteName || ''} onChange={e => handleChange('siteName', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Font Family</label>
                  <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.fontFamily || ''} onChange={e => handleChange('fontFamily', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tagline</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.tagline || ''} onChange={e => handleChange('tagline', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Color Scheme</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map(field => (
                  <div key={field} className="space-y-2">
                    <label className="text-sm font-medium capitalize">{field.replace('Color', '')}</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border shadow-sm" style={{ backgroundColor: (form as any)[field] || '#ccc' }} />
                      <input className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono" value={(form as any)[field] || ''} onChange={e => handleChange(field, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <div className="h-2" style={{ backgroundColor: form.primaryColor || '#1e40af' }} />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: form.primaryColor || '#1e40af' }}>O</div>
                    <div>
                      <p className="font-bold" style={{ fontFamily: form.fontFamily || 'inherit' }}>{form.siteName || 'Ogbenjuwa'}</p>
                      <p className="text-sm text-muted-foreground">{form.tagline || 'Community Security & Safety Platform'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-white text-xs font-medium" style={{ backgroundColor: form.primaryColor || '#1e40af' }}>Primary</span>
                    <span className="px-3 py-1 rounded-full text-white text-xs font-medium" style={{ backgroundColor: form.secondaryColor || '#64748b' }}>Secondary</span>
                    <span className="px-3 py-1 rounded-full text-white text-xs font-medium" style={{ backgroundColor: form.accentColor || '#f59e0b' }}>Accent</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logo Tab */}
      {activeTab === 'logo' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Site Logo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center bg-muted/30">
                  {form.logoUrl ? <img src={form.logoUrl} alt="Logo" className="max-w-full max-h-full rounded-lg" /> : <Upload className="w-8 h-8 text-muted-foreground/40" />}
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium">Logo URL</p>
                  <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="https://example.com/logo.png" value={form.logoUrl || ''} onChange={e => handleChange('logoUrl', e.target.value)} />
                  <p className="text-xs text-muted-foreground">PNG, JPG, or WebP recommended. Max 2MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Favicon</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30">
                  {form.faviconUrl ? <img src={form.faviconUrl} alt="Favicon" className="max-w-full max-h-full rounded" /> : <Upload className="w-4 h-4 text-muted-foreground/40" />}
                </div>
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium">Favicon URL</p>
                  <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="https://example.com/favicon.ico" value={form.faviconUrl || ''} onChange={e => handleChange('faviconUrl', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hero Content Tab */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Heading</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.heroHeading || ''} onChange={e => handleChange('heroHeading', e.target.value)} placeholder="Community Security & Safety Network" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subheading</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.heroSubheading || ''} onChange={e => handleChange('heroSubheading', e.target.value)} placeholder="Warriors protecting the Idoma Region" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description</label>
                <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={form.heroDescription || ''} onChange={e => handleChange('heroDescription', e.target.value)} placeholder="An early-warning and emergency response platform..." />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Call-to-Action Buttons</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Primary CTA Text</label>
                  <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.heroCtaText || ''} onChange={e => handleChange('heroCtaText', e.target.value)} placeholder="Live Demo" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Primary CTA Link</label>
                  <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.heroCtaLink || ''} onChange={e => handleChange('heroCtaLink', e.target.value)} placeholder="/login" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Secondary CTA Text</label>
                  <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.heroSecondaryCtaText || ''} onChange={e => handleChange('heroSecondaryCtaText', e.target.value)} placeholder="Patrol Map" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Secondary CTA Link</label>
                  <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.heroSecondaryCtaLink || ''} onChange={e => handleChange('heroSecondaryCtaLink', e.target.value)} placeholder="/patrol" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Meta & SEO Tab */}
      {activeTab === 'meta' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Search Engine Meta Tags</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Meta Description</label>
                <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={form.metaDescription || ''} onChange={e => handleChange('metaDescription', e.target.value)} placeholder="Ogbenjuwa Community Safety Network..." />
                <p className="text-xs text-muted-foreground">Appears in search engine results. Recommended: 150-160 characters.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Meta Keywords</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.metaKeywords || ''} onChange={e => handleChange('metaKeywords', e.target.value)} placeholder="Ogbenjuwa, community safety, Idoma..." />
                <p className="text-xs text-muted-foreground">Comma-separated keywords for search engines.</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Open Graph / Social Sharing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">OG Title</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.ogTitle || ''} onChange={e => handleChange('ogTitle', e.target.value)} placeholder="Ogbenjuwa — Community Safety Network" />
                <p className="text-xs text-muted-foreground">Title shown when shared on Facebook, Twitter, WhatsApp. Falls back to site name if empty.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">OG Description</label>
                <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={form.ogDescription || ''} onChange={e => handleChange('ogDescription', e.target.value)} />
                <p className="text-xs text-muted-foreground">Description shown when shared on social media. Falls back to meta description if empty.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">OG Image URL</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.ogImage || ''} onChange={e => handleChange('ogImage', e.target.value)} placeholder="https://example.com/og-image.png" />
                <p className="text-xs text-muted-foreground">Image shown when shared. Recommended: 1200x630px.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" type="email" value={form.emailContact || ''} onChange={e => handleChange('emailContact', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.phoneContact || ''} onChange={e => handleChange('phoneContact', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Address</label>
              <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.address || ''} onChange={e => handleChange('address', e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <Card>
          <CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {['twitter', 'facebook', 'instagram', 'linkedin', 'youtube'].map(p => (
              <div key={p} className="flex items-center gap-3">
                <label className="w-24 text-sm font-medium capitalize">{p}</label>
                <input className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder={`https://${p}.com/your-page`} value={form.socialLinks?.[p] || ''} onChange={e => handleSocialChange(p, e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Footer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Footer Text</label>
              <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={form.footerText || ''} onChange={e => handleChange('footerText', e.target.value)} placeholder="Warriors protecting the Idoma Region, Benue State, Nigeria." />
            </div>
          </CardContent>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Maintenance Mode</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Only super admins can access when enabled</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.maintenanceMode || false} onChange={e => handleChange('maintenanceMode', e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  );
}
