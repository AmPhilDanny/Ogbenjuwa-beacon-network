import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Map, BarChart3, AlertTriangle, Shield, MapPin,
  Users, Settings, ChevronLeft, ChevronRight, Activity, Clock,
  Phone, AlertCircle, Timer,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';
import { responseTimeColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

// ─── Sidebar nav items ───────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    labelKey: 'sidebar.overview',
    items: [
      { id: 'dashboard',    labelKey: 'nav.dashboard',     icon: LayoutDashboard },
      { id: 'incident-map', labelKey: 'sidebar.incident_map',   icon: Map },
      { id: 'analytics',    labelKey: 'sidebar.analytics',      icon: BarChart3 },
    ],
  },
  {
    labelKey: 'nav.operations',
    items: [
      { id: 'alert-history',  labelKey: 'sidebar.alert_history',    icon: AlertTriangle },
      { id: 'patrol-status',  labelKey: 'sidebar.patrol_status',    icon: Shield },
      { id: 'resources',      labelKey: 'nav.resources',        icon: MapPin },
      { id: 'reunification',  labelKey: 'sidebar.reunification',    icon: Users },
    ],
  },
  {
    labelKey: 'sidebar.admin',
    items: [
      { id: 'lga-nodes',          labelKey: 'sidebar.lga_nodes',           icon: Activity },
      { id: 'community-admins',   labelKey: 'sidebar.comm_admins',    icon: Users },
      { id: 'settings',           labelKey: 'sidebar.settings',            icon: Settings },
    ],
  },
];

interface DashboardStats {
  activeAlerts: number;
  totalUsers: number;
  totalLgas: number;
  activePatrols: number;
  activeSosSignals: number;
  openIncidents: number;
}

interface LgaIncident {
  lga: string;
  lga_id: string;
  count: number;
}

interface RecentAlert {
  id: string;
  type: string;
  severity: string;
  status: string;
  location: string;
  createdAt: string;
}

// ─── KPI Card ────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className={`h-5 w-5 shrink-0 ${color}`} />
        <div>
          <div className="text-xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Incident Feed Item ──────────────────────────────────────────────────
function IncidentRow({ incident }: { incident: RecentAlert }) {
  const statusColor =
    incident.status === 'active' ? 'text-red-500' :
    incident.status === 'monitoring' ? 'text-amber-500' :
    'text-green-500';

  const badgeVariant =
    incident.status === 'active' ? 'destructive' :
    incident.status === 'monitoring' ? 'outline' :
    'secondary';

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className={`h-2 w-2 rounded-full mt-1.5 ${statusColor} bg-current`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{incident.type}</span>
          <Badge variant={badgeVariant} className="text-[10px] h-5 px-1.5 capitalize">
            {incident.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {incident.location || 'Idoma Region'} · {new Date(incident.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ─── Severity Bar ──────────────────────────────────────────────────────────
function SeverityBar({ lga, count, maxCount }: { lga: string; count: number; maxCount: number }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-right shrink-0 text-muted-foreground">{lga}</span>
      <div className="flex-1 h-5 bg-muted/30 rounded-sm overflow-hidden">
        <div className="h-full rounded-sm transition-all bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-right shrink-0 font-mono">{count}</span>
    </div>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────
export default function Dashboard() {
  const { lang } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lgaIncidents, setLgaIncidents] = useState<LgaIncident[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>('/dashboard/stats').catch(() => null),
      api.get<{ data: LgaIncident[] }>('/dashboard/incidents-by-lga').catch(() => ({ data: [] })),
      api.get<{ data: RecentAlert[] }>('/dashboard/recent-alerts?limit=5').catch(() => ({ data: [] })),
    ]).then(([statsData, lgaData, alertsData]) => {
      if (statsData) setStats(statsData);
      if (lgaData) setLgaIncidents(lgaData.data);
      if (alertsData) setRecentAlerts(alertsData.data);
    }).finally(() => setLoading(false));
  }, []);

  const maxLgaCount = Math.max(...lgaIncidents.map(s => s.count), 1);

  const activeIncidents = stats?.activeAlerts ?? 0;

  return (
    <div className="flex gap-6">
      {/* ─── SIDEBAR ─────────────────────────────── */}
      <div
        className={cn(
          'shrink-0 transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-[240px]' : 'w-0 overflow-hidden',
        )}
      >
        <div className="w-[240px] border-r border-border/50 pr-4 h-full">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-6 py-1">
              {NAV_SECTIONS.map((section) => (
                <div key={section.labelKey}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-2">
                    {t(section.labelKey, lang)}
                  </p>
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
                        item.id === 'dashboard'
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30',
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {t(item.labelKey, lang)}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen((o) => !o)}
        className={cn(
          'shrink-0 h-8 w-6 flex items-center justify-center rounded-r-md border border-l-0 border-border/50 bg-card hover:bg-muted/30 transition-colors -ml-[1px] mt-2',
        )}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {/* ─── MAIN CONTENT ────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title', lang)}</h1>
          <p className="text-muted-foreground">
            Real-time operations overview — Idoma Region
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading dashboard data...</p>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard icon={AlertCircle} label={t('dashboard.incidents', lang)} value={String(stats?.openIncidents ?? 0)} sub="Requires attention" color="text-red-500" />
              <KpiCard icon={Phone} label={t('dashboard.sms_today', lang)} value={String(stats?.activeAlerts ?? 0)} sub="Active alerts" color="text-green-500" />
              <KpiCard icon={Timer} label={t('dashboard.avg_delivery', lang)} value={String(stats?.activePatrols ?? 0)} sub="Active patrols" color="text-amber-500" />
              <KpiCard icon={Users} label={t('dashboard.contacts', lang)} value={(stats?.totalUsers ?? 0).toLocaleString()} sub="Registered users" color="text-blue-500" />
            </div>

            {/* Heatmap + Incident Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Heatmap */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    {t('dashboard.heatmap', lang)}
                  </CardTitle>
                  <CardDescription>Live incident density — Idoma Region</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="map-placeholder h-[300px] relative">
                    <div className="heat-blob w-36 h-36 bg-red-500/40 top-[15%] left-[30%]" />
                    <div className="heat-blob w-28 h-28 bg-red-500/30 top-[50%] left-[20%]" />
                    <div className="heat-blob w-24 h-24 bg-amber-500/40 top-[25%] left-[60%]" />
                    <div className="heat-blob w-20 h-20 bg-amber-500/30 top-[60%] left-[55%]" />
                    <div className="heat-blob w-16 h-16 bg-green-500/30 top-[40%] left-[75%]" />

                    <span className="absolute text-[10px] text-muted-foreground font-mono top-[12%] left-[28%]">Agatu</span>
                    <span className="absolute text-[10px] text-muted-foreground font-mono top-[48%] left-[15%]">Apa</span>
                    <span className="absolute text-[10px] text-muted-foreground font-mono top-[22%] left-[55%]">Otukpo</span>
                    <span className="absolute text-[10px] text-muted-foreground font-mono top-[55%] left-[50%]">Ado</span>
                    <span className="absolute text-[10px] text-muted-foreground font-mono top-[38%] left-[72%]">Obi</span>

                    <div className="absolute bottom-3 right-3 flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/50">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <span className="text-[10px] text-muted-foreground">Low</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-[10px] text-muted-foreground">Med</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <span className="text-[10px] text-muted-foreground">High</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Incident Feed */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-500" />
                    {t('dashboard.feed', lang)}
                  </CardTitle>
                  <CardDescription>Most recent reports</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="px-4 pb-4">
                    <ScrollArea className="h-[260px]">
                      {recentAlerts.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No recent alerts</p>
                      ) : (
                        recentAlerts.map((inc) => (
                          <IncidentRow key={inc.id} incident={inc} />
                        ))
                      )}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {t('dashboard.by_lga', lang)}
                  </CardTitle>
                  <CardDescription>Total reported incidents per local government area</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lgaIncidents.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No incident data yet</p>
                  ) : (
                    lgaIncidents.map((s) => (
                      <SeverityBar key={s.lga_id} lga={s.lga} count={s.count} maxCount={maxLgaCount} />
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Coverage Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Coverage Overview
                  </CardTitle>
                  <CardDescription>System coverage across the Idoma region</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-sm">Total LGAs</span>
                      <span className="text-sm font-mono font-semibold">{stats?.totalLgas ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-sm">Active Alerts</span>
                      <span className="text-sm font-mono font-semibold text-red-500">{stats?.activeAlerts ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-sm">Active Patrols</span>
                      <span className="text-sm font-mono font-semibold text-green-500">{stats?.activePatrols ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-sm">Active SOS Signals</span>
                      <span className="text-sm font-mono font-semibold text-orange-500">{stats?.activeSosSignals ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">Total Users</span>
                      <span className="text-sm font-mono font-semibold">{stats?.totalUsers?.toLocaleString() ?? 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
