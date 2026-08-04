import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { AlertTriangle, Users, MapPin, Siren, Activity } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { formatRelativeTime } from '../lib/utils';
import type { Alert, DashboardStats, Lga } from '../lib/types';

export default function Dashboard() {
  const { data: stats } = useApi<DashboardStats>('/dashboard/stats');
  const { data: alertsData } = useApi<{ data: Alert[] }>('/alerts?limit=5');
  const { data: lgasData } = useApi<{ data: Lga[] }>('/lgas');

  const alerts = alertsData?.data || [];
  const lgas = lgasData?.data || [];
  const activeLgas = lgas.filter((l) => l.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ogbenjuwa Central Command overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard icon={AlertTriangle} label="Active Alerts" value={stats?.activeAlerts ?? 0} subtext="Across all LGAs" />
        <StatsCard icon={Users} label="Operators" value={stats?.totalUsers ?? 0} subtext="Registered personnel" />
        <StatsCard icon={MapPin} label="LGAs Covered" value={activeLgas} subtext={`of ${lgas.length} configured`} />
        <StatsCard icon={Siren} label="Active Patrols" value={stats?.activePatrols ?? 0} subtext="Currently deployed" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No recent alerts</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{formatRelativeTime(alert.createdAt)}</p>
                    </div>
                    <StatusBadge status={alert.severity} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              LGA Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lgas.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No LGAs configured yet</p>
            ) : (
              <ul className="space-y-2">
                {lgas.map((l) => (
                  <li key={l.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{l.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.code} · {l.coverageTarget}% target
                        {l.lat != null && l.lng != null ? ' · mapped' : ' · not mapped'}
                      </p>
                    </div>
                    <StatusBadge status={l.isActive ? 'active' : 'inactive'} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
