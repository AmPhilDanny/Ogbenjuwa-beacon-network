import { useState, useEffect } from 'react';
import { Shield, Map } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import LgaSelector from './LgaSelector';
import AlertOverview from './AlertOverview';
import CommunityAnnouncements from './CommunityAnnouncements';
import SmsAlerts from './SmsAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IncidentMap } from '@/components/IncidentMap';

interface DashboardStats {
  activeAlerts: number;
  totalUsers: number;
  totalLgas: number;
  activePatrols: number;
  openIncidents: number;
}

export default function CommunityDashboard() {
  const { t } = useLanguage();
  const [selectedLga, setSelectedLga] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>('/dashboard/stats')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('community.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('community.alerts_by_lga')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('community.total_alerts')}</p>
            <p className="text-2xl font-bold">{loading ? '...' : (stats?.activeAlerts ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('community.high')}</p>
            <p className="text-2xl font-bold text-red-500">{loading ? '...' : (stats?.openIncidents ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{t('community.lga_monitored') || 'LGAs Monitored'}</p>
            <p className="text-2xl font-bold">{loading ? '...' : (stats?.totalLgas ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Incident Map */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Map className="h-4 w-4" />
            {t('community.live_map') || 'Live Incident Map'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[350px] w-full rounded-b-xl overflow-hidden">
            <IncidentMap />
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="text-sm font-medium mb-2">{t('community.select_lga')}</p>
        <LgaSelector selected={selectedLga} onChange={setSelectedLga} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AlertOverview lga={selectedLga} />
        <CommunityAnnouncements />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SmsAlerts lga={selectedLga} />
        <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4 text-ogbenjuwa-green" />
            {t('community.safety_tips')}
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
            <li>{t('community.tip_1')}</li>
            <li>{t('community.tip_2')}</li>
            <li>{t('community.tip_3')}</li>
          </ul>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
