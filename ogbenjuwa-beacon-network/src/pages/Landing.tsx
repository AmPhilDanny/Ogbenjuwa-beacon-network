import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Clock, Users, MapPin, ArrowRight, Target, Radio, MessageSquare, Smartphone, Globe, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getSiteSettings } from '@/lib/site-settings';
import { api } from '@/lib/api';

// ─── Terminal lines ──────────────────────────────────────────────────────
const TERMINAL_LINES = [
  { text: '> ogbenjuwa@init --region=idoma',    delay: 0 },
  { text: '> Scanning 9 LGAs...',                delay: 1 },
  { text: '> Otukpo: 12,400 residents',          delay: 2 },
  { text: '> Agatu: 3,200 residents',            delay: 3 },
  { text: '> Apa: 5,600 residents',              delay: 4 },
  { text: '> WARNING: 0 early-warning systems', delay: 5 },
  { text: '> Avg response time: 4h 12m',        delay: 6 },
  { text: '> 2.1M displaced across region',     delay: 7 },
  { text: '> Deploying Ogbenjuwa beacon nodes', delay: 8 },
  { text: '> ✓ 9/9 LGAs connected',             delay: 9 },
  { text: '> ✓ Warriors ready. Awaiting alert.', delay: 10 },
];

// ─── Crisis feed items ───────────────────────────────────────────────────
const CRISIS_ITEMS = [
  { type: 'attack',   label: 'Armed Attack Reported',  lga: 'Agatu',   color: 'text-red-500' },
  { type: 'displaced',label: 'Displacement Alert',      lga: 'Apa',     color: 'text-amber-500' },
  { type: 'medical',  label: 'Medical Emergency',       lga: 'Otukpo',  color: 'text-purple-500' },
  { type: 'response', label: 'Slow Response Warning',   lga: 'Ado',     color: 'text-red-500' },
];

// ─── Pain points ─────────────────────────────────────────────────────────
const PAIN_POINTS = [
  { icon: Clock,     title: '4h+ Response Time',  desc: 'Communities wait hours for help. Every minute matters in an emergency.' },
  { icon: Radio,     title: 'No Alert Systems',    desc: 'Zero coordinated early-warning infrastructure across 9 LGAs.' },
  { icon: MapPin,    title: '2.1M Displaced',      desc: 'Ongoing crisis has displaced millions with no reunification system.' },
];

// ─── Solutions ────────────────────────────────────────────────────────────
const SOLUTIONS = [
  { icon: AlertTriangle, title: 'SOS Alerts',       desc: 'Instant mass-SMS broadcast to all registered contacts in <2 minutes.',     enabled: true },
  { icon: Radio,         title: 'Patrol Network',   desc: 'Real-time patrol tracking with dead man switch and sighting reporting.',   enabled: true },
  { icon: Users,         title: 'Reunification',    desc: 'Fuzzy-name search registry to reconnect displaced families.',               enabled: true },
  { icon: BarChart3,     title: 'Command Dashboard',desc: 'Live incident heatmap, response times, and LGA-level analytics.',          enabled: true },
  { icon: Smartphone,    title: 'USSD Integration', desc: 'Works on any phone — dial *347# to send alerts without smartphone/data.',  enabled: false },
  { icon: Globe,         title: 'Mesh Network',     desc: 'Offline mesh relay for when cellular networks are down or congested.',      enabled: false },
];

// ─── Revenue streams ──────────────────────────────────────────────────────
const REVENUE_ITEMS = [
  { label: 'LGA Licensing',      amount: '₦50M', desc: 'Annual subscription per LGA' },
  { label: 'Hardware & Sensors', amount: '₦9M',  desc: 'Beacon nodes & IoT deployment' },
  { label: 'Training & Support', amount: '₦15M', desc: 'Community training & 24/7 support' },
  { label: 'Data Analytics',     amount: '₦6M',  desc: 'Anonymized incident reporting' },
];

// ─── Roadmap ─────────────────────────────────────────────────────────────
const ROADMAP_STEPS = [
  { phase: 'Q3 2026', title: 'MVP Launch',     desc: 'SOS alerts, patrol tracking, reunification in 3 pilot LGAs' },
  { phase: 'Q4 2026', title: 'Scaling',        desc: '9/9 LGAs live, USSD/SMS integration, command dashboard' },
  { phase: 'Q1 2027', title: 'Mesh Network',   desc: 'Offline mesh relay, hardware beacon deployment, IoT sensors' },
  { phase: 'Q2 2027', title: 'Full Coverage',  desc: 'Regional expansion, interoperability with state emergency services' },
];

// ─── Component: Crisis Ticker ────────────────────────────────────────────
function CrisisTicker() {
  const [tickerText, setTickerText] = useState('CRISIS ALERT: Benue State — 2.1M displaced · 9 LGAs affected · 0 early-warning systems · Avg response >4h');
  useEffect(() => {
    api.get<{ activePatrolsToday?: number; coveragePercent?: number; totalAlertsToday?: number }>('/dashboard/public-stats')
      .then(s => {
        if (s && s.totalAlertsToday !== undefined) {
          setTickerText(`Ogbenjuwa LIVE · ${s.totalAlertsToday} alerts today · ${s.activePatrolsToday || 0} active patrols · ${s.coveragePercent || 0}% LGA coverage`);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <div className="overflow-hidden bg-red-600/10 border border-red-500/30 rounded-lg px-4 py-2">
      <div className="flex items-center gap-2 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
        <span className="text-xs font-mono text-red-400 uppercase tracking-wider">
          {tickerText}
        </span>
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
      </div>
    </div>
  );
}

// ─── Component: Stats Card ───────────────────────────────────────────────
function CrisisStats() {
  const { lang } = useLanguage();
  const [liveStats, setLiveStats] = useState<{ activePatrolsToday?: number; coveragePercent?: number; totalAlertsToday?: number }>({});
  useEffect(() => {
    api.get<{ activePatrolsToday: number; coveragePercent: number; totalAlertsToday: number }>('/dashboard/public-stats')
      .then(setLiveStats)
      .catch(() => {});
  }, []);
  const stats = [
    { key: 'landing.displaced',  value: liveStats.totalAlertsToday?.toString() || '0',     color: 'text-red-400', label: 'Alerts Today' },
    { key: 'landing.lgas',       value: liveStats.coveragePercent?.toString() + '%' || '9', color: 'text-amber-400', label: 'LGA Coverage' },
    { key: 'landing.response',   value: liveStats.activePatrolsToday?.toString() || '0',    color: 'text-green-400', label: 'Active Patrols' },
    { key: 'landing.alert_systems', value: '✓',      color: 'text-emerald-400', label: 'System Active' },
  ];
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-red-500/20">
      <CardContent className="p-5 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-4 w-4" />
          {t('landing.crisis_numbers', lang)}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.key} className="text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────
export default function Landing() {
  const { isAuthenticated } = useAuth();
  const { lang } = useLanguage();
  const brand = getSiteSettings();
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [visibleCrisis, setVisibleCrisis] = useState<number[]>([]);

  // Terminal animation
  useEffect(() => {
    const timers = TERMINAL_LINES.map((line) =>
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.delay]);
      }, 800 + line.delay * 400),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Crisis feed stagger
  useEffect(() => {
    const timers = CRISIS_ITEMS.map((_, i) =>
      setTimeout(() => {
        setVisibleCrisis((prev) => [...prev, i]);
      }, 600 + i * 600),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/50">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              {brand?.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.siteName} className="h-8 w-8 rounded object-contain" />
              ) : (
                <Shield className="h-6 w-6 text-primary" />
              )}
              <span className="font-serif text-xl font-bold tracking-tight">{brand?.siteName || 'Ogbenjuwa'}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <ThemeToggle />
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="sm" className="gap-2">
                    Go to Dashboard <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
              )}
            </div>
          </nav>

          {/* Ticker */}
          <CrisisTicker />

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-10">
            {/* Left */}
            <div className="space-y-6">
              {brand?.heroSubheading && (
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                  <Shield className="h-3 w-3 mr-1" />
                  {brand.heroSubheading}
                </Badge>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight">
                {brand?.heroHeading || t('landing.hero_title', lang)}{' '}
                <span className="text-primary">{t('landing.hero_highlight', lang)}</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {brand?.heroDescription || `${brand?.siteName || 'Ogbenjuwa'} is an early-warning and emergency response platform for the Idoma Region, Benue State. Sub-2-minute alerting across 9 LGAs — no smartphone required.`}
              </p>
              <div className="flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Link to="/alert">
                    <Button size="lg" className="gap-2">
                      {brand?.heroCtaText || 'Launch Alert Demo'} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to={brand?.heroCtaLink || '/login'}>
                    <Button size="lg" className="gap-2">
                      {brand?.heroCtaText || 'Live Demo'} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link to={brand?.heroSecondaryCtaLink || '/patrol'}>
                  <Button size="lg" variant="outline" className="gap-2">
                    {brand?.heroSecondaryCtaText || 'Patrol Map'} <MapPin className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Crisis stats + feed */}
            <div className="space-y-4">
              <CrisisStats />

              {/* Live incident feed */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('landing.live_feed', lang)}</span>
                  </div>
                  <div className="space-y-2">
                    {CRISIS_ITEMS.map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-xs transition-all duration-500 ${
                          visibleCrisis.includes(i)
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-4'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.color} bg-current`} />
                        <span className="text-muted-foreground">{item.lga}:</span>
                        <span className="text-foreground">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────── */}
      <section className="border-b border-border/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">{t('landing.problem', lang)}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The Idoma region faces a safety crisis with no coordinated early-warning infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Pain points */}
            <div className="space-y-4">
              {PAIN_POINTS.map((p, i) => (
                <div key={i} className="flex items-start gap-4 bg-card/30 rounded-xl border border-border/50 p-5">
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <p.icon className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Terminal */}
            <div className="bg-black/90 rounded-xl border border-green-500/20 p-5 font-mono text-xs leading-relaxed min-h-[300px]">
              <div className="flex items-center gap-1.5 mb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-[10px] text-muted-foreground uppercase tracking-wider">system-assessment — 2026</span>
              </div>
              {TERMINAL_LINES.map((line) => (
                <div
                  key={line.delay}
                  className={`transition-all duration-300 ${
                    visibleLines.includes(line.delay)
                      ? 'opacity-100'
                      : 'opacity-0'
                  }`}
                >
                  <span className={line.text.startsWith('> WARNING') ? 'text-red-400' : line.text.startsWith('> ✓') ? 'text-green-400' : 'text-green-300'}>
                    {line.text}
                  </span>
                </div>
              ))}
              {visibleLines.length === TERMINAL_LINES.length && (
                <span className="text-green-400 animate-pulse mt-2 block">▌</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUTION ───────────────────────────────── */}
      <section className="border-b border-border/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-3">{t('landing.solution', lang)}</Badge>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">{t('landing.solution', lang)}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A multi-channel safety network that works on any phone — from Nokia 105 to iPhone 16.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOLUTIONS.map((s, i) => (
              <Card
                key={i}
                className={`border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg ${
                  !s.enabled ? 'opacity-40 grayscale' : ''
                }`}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{s.title}</h3>
                    {!s.enabled && <Badge variant="outline" className="text-[9px] h-4 px-1">Coming Soon</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVENUE ────────────────────────────────── */}
      <section className="border-b border-border/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">{t('landing.revenue_model', lang)}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sustainable, scalable — projected ₦80M annual revenue at full deployment.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {REVENUE_ITEMS.map((r, i) => (
              <Card key={i} className="border-primary/20 bg-primary/5 text-center">
                <CardContent className="p-6 space-y-2">
                  <div className="text-3xl font-bold text-primary">{r.amount}</div>
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-2xl font-bold font-serif">
              Total: <span className="text-primary">₦80M</span>
              <span className="text-muted-foreground text-base font-normal"> / year</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── ROADMAP ────────────────────────────────── */}
      <section className="border-b border-border/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">{t('landing.roadmap', lang)}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From MVP to full regional coverage in 4 phases.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-8 left-[10%] right-[10%] h-0.5 bg-primary/20 hidden lg:block" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ROADMAP_STEPS.map((r, i) => (
                <div key={i} className="relative">
                  <div className="hidden lg:flex items-center justify-center mb-6">
                    <div className="h-4 w-4 rounded-full bg-primary border-4 border-background z-10" />
                  </div>
                  <Card className="border-border/50 h-full">
                    <CardContent className="p-5 space-y-2">
                      <Badge variant="outline" className="text-[10px] font-mono">{r.phase}</Badge>
                      <h3 className="font-semibold">{r.title}</h3>
                      <p className="text-sm text-muted-foreground">{r.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold">
            Invest in the Warriors of Idoma
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We are seeking <span className="text-primary font-semibold">₦120M seed funding</span> to deploy beacon
            infrastructure across all 9 LGAs and save lives.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="gap-2">
              <Target className="h-4 w-4" />
              Invest in Ogbenjuwa
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="border-t border-border/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {brand?.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.siteName} className="h-6 w-6 rounded object-contain" />
            ) : (
              <Shield className="h-5 w-5 text-primary" />
            )}
            <span className="font-serif text-lg font-bold">{brand?.siteName || 'Ogbenjuwa'}</span>
          </div>
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            {brand?.footerText || brand?.tagline || 'Warriors protecting the Idoma Region, Benue State, Nigeria.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
