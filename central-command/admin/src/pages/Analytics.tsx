import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { api } from '../lib/api';
import { BarChart3, AlertTriangle, Users, MapPin, Siren, ShieldAlert, Activity, TrendingUp, PieChart, Download } from 'lucide-react';

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

interface TrendDay {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface SeverityCount {
  severity: string;
  count: number;
}

const statCards = [
  { key: 'activeAlerts', label: 'Active Alerts', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'totalLgas', label: 'LGAs Covered', icon: MapPin, color: 'text-green-500', bg: 'bg-green-50' },
  { key: 'activePatrols', label: 'Active Patrols', icon: Siren, color: 'text-purple-500', bg: 'bg-purple-50' },
  { key: 'activeSosSignals', label: 'Active SOS', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
  { key: 'openIncidents', label: 'Open Incidents', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50' },
];

const severityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

const SEVERITY_BG: Record<string, string> = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#16A34A',
};

export default function Analytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lgaData, setLgaData] = useState<LgaIncident[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [trends, setTrends] = useState<TrendDay[]>([]);
  const [severityData, setSeverityData] = useState<SeverityCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardStats>('/dashboard/stats'),
      api.get<{ data: LgaIncident[] }>('/dashboard/incidents-by-lga'),
      api.get<{ data: RecentAlert[] }>('/dashboard/recent-alerts?limit=5'),
      api.get<{ data: TrendDay[] }>('/dashboard/trends'),
      api.get<{ data: SeverityCount[] }>('/dashboard/severity-breakdown'),
    ])
      .then(([statsRes, lgaRes, alertsRes, trendsRes, severityRes]) => {
        setStats(statsRes);
        setLgaData(lgaRes.data);
        setRecentAlerts(alertsRes.data);
        setTrends(trendsRes.data);
        setSeverityData(severityRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  // Chart dimensions
  const CHART_H = 180;
  const BAR_W = Math.max(12, Math.min(32, Math.floor(480 / Math.max(trends.length, 1))));
  const maxTotal = Math.max(...trends.map(t => t.total), 1);

  const totalSeverity = severityData.reduce((s, x) => s + x.count, 0) || 1;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Data insights and reporting</p>
        </div>
        <a
          href={`${import.meta.env.VITE_API_URL || 'http://localhost:4001/api/v1'}/dashboard/export/csv`}
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          target="_blank"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </a>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {statCards.map(s => (
          <Card key={s.key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stats ? (stats as any)[s.key] ?? 0 : '-'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              14-Day Alert Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trends.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <BarChart3 className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No trend data yet</p>
              </div>
            ) : (
              <svg viewBox={`0 0 ${Math.max(trends.length * (BAR_W + 4) + 20, 200)} ${CHART_H + 30}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                {/* Y axis labels */}
                {[0, 0.5, 1].map((pct) => {
                  const y = CHART_H - pct * CHART_H;
                  return (
                    <g key={pct}>
                      <text x="0" y={y + 4} fontSize="9" fill="#94a3b8">{Math.round(pct * maxTotal)}</text>
                      <line x1="25" y1={y} x2={Math.max(trends.length * (BAR_W + 4) + 10, 200)} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
                    </g>
                  );
                })}
                {/* Stacked bars */}
                {trends.map((d, i) => {
                  const x = 25 + i * (BAR_W + 4);
                  const criticalH = (d.critical / maxTotal) * CHART_H;
                  const highH = (d.high / maxTotal) * CHART_H;
                  const mediumH = (d.medium / maxTotal) * CHART_H;
                  const lowH = (d.low / maxTotal) * CHART_H;
                  const totalH = (d.total / maxTotal) * CHART_H;
                  let yOffset = CHART_H;
                  const label = d.date.slice(5);

                  const layers = [
                    { h: lowH, color: '#16A34A' },
                    { h: mediumH, color: '#D97706' },
                    { h: highH, color: '#EA580C' },
                    { h: criticalH, color: '#DC2626' },
                  ];

                  return (
                    <g key={d.date}>
                      {layers.map((l) => {
                        if (l.h <= 0) return null;
                        yOffset -= l.h;
                        return <rect key={l.color} x={x} y={yOffset} width={BAR_W} height={l.h} fill={l.color} rx="2" />;
                      })}
                      {i % 2 === 0 && <text x={x + BAR_W / 2} y={CHART_H + 14} fontSize="8" fill="#94a3b8" textAnchor="middle">{label}</text>}
                    </g>
                  );
                })}
                {/* Legend */}
                <g transform={`translate(25, ${CHART_H + 22})`}>
                  {['Critical', 'High', 'Medium', 'Low'].map((lbl, i) => (
                    <g key={lbl} transform={`translate(${i * 60}, 0)`}>
                      <rect x="0" y="0" width="8" height="8" fill={['#DC2626', '#EA580C', '#D97706', '#16A34A'][i]} rx="1" />
                      <text x="11" y="7" fontSize="9" fill="#64748b">{lbl}</text>
                    </g>
                  ))}
                </g>
              </svg>
            )}
          </CardContent>
        </Card>

        {/* Severity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <PieChart className="w-4 h-4" />
              Severity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {severityData.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <PieChart className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No severity data yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Donut chart */}
                <svg viewBox="0 0 120 120" className="w-32 h-32 mx-auto">
                  {(() => {
                    const cx = 60, cy = 60, r = 48, sw = 20;
                    let angle = -90;
                    const segments = severityData.map(s => {
                      const pct = s.count / totalSeverity;
                      const a = pct * 360;
                      const startAngle = angle;
                      angle += a;
                      return { severity: s.severity, pct, startAngle, endAngle: angle, color: SEVERITY_BG[s.severity] || '#94a3b8' };
                    });

                    return segments.map((seg, i) => {
                      const sRad = (seg.startAngle * Math.PI) / 180;
                      const eRad = (seg.endAngle * Math.PI) / 180;
                      const x1 = cx + r * Math.cos(sRad);
                      const y1 = cy + r * Math.sin(sRad);
                      const x2 = cx + r * Math.cos(eRad);
                      const y2 = cy + r * Math.sin(eRad);
                      const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;

                      const outer = `M ${cx + r * Math.cos(sRad)} ${cy + r * Math.sin(sRad)} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
                      const innerR = r - sw;
                      const ix1 = cx + innerR * Math.cos(eRad);
                      const iy1 = cy + innerR * Math.sin(eRad);
                      const ix2 = cx + innerR * Math.cos(sRad);
                      const iy2 = cy + innerR * Math.sin(sRad);
                      const inner = `L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

                      return <path key={i} d={outer + inner} fill={seg.color} />;
                    });
                  })()}
                  <circle cx="60" cy="60" r="28" fill="white" />
                  <text x="60" y="56" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e293b">{severityData.reduce((s, x) => s + x.count, 0)}</text>
                  <text x="60" y="68" textAnchor="middle" fontSize="8" fill="#94a3b8">total</text>
                </svg>

                {/* Legend */}
                <div className="space-y-1.5">
                  {severityData.map(s => (
                    <div key={s.severity} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: SEVERITY_BG[s.severity] || '#94a3b8' }} />
                        <span className="capitalize">{s.severity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{s.count}</span>
                        <span className="text-muted-foreground text-xs">{Math.round((s.count / totalSeverity) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by LGA */}
        <Card>
          <CardHeader><CardTitle>Incidents by LGA</CardTitle></CardHeader>
          <CardContent>
            {lgaData.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <BarChart3 className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No incident data yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lgaData.map(l => {
                  const maxCount = Math.max(...lgaData.map(x => x.count), 1);
                  const pct = (l.count / maxCount) * 100;
                  return (
                    <div key={l.lga_id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{l.lga}</span>
                        <span className="font-medium">{l.count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader><CardTitle>Recent Alerts</CardTitle></CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No recent alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map(a => (
                  <div key={a.id} className="flex items-start justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${severityColor[a.severity] || 'bg-gray-100 text-gray-700'}`}>
                          {a.severity}
                        </span>
                        <span className="text-sm font-medium truncate">{a.type}</span>
                      </div>
                      {a.location && <p className="text-xs text-muted-foreground mt-0.5">{a.location}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground/60 shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
