import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';
import { AlertTriangle, Users, MapPin, Siren, Activity } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { formatRelativeTime } from '../lib/utils';
import type { Alert } from '../lib/types';

export default function Dashboard() {
  const { data: alertsData } = useApi<{ data: Alert[] }>('/alerts?limit=5');
  const alerts = alertsData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Ogbenjuwa Central Command overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard icon={AlertTriangle} label="Active Alerts" value="0" subtext="Across all LGAs" />
        <StatsCard icon={Users} label="Operators" value="0" subtext="Registered personnel" />
        <StatsCard icon={MapPin} label="LGAs Covered" value="0" subtext="of 23 active" />
        <StatsCard icon={Siren} label="Active Patrols" value="0" subtext="Currently deployed" />
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
            <p className="text-sm text-muted-foreground py-8 text-center">Coverage data will appear once LGAs are configured</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
