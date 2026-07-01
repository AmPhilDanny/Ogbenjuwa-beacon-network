import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import PublicKpiRow from './PublicKpiRow';
import PublicAlertFeed from './PublicAlertFeed';
import PublicStats from './PublicStats';
import type { PublicPatrolStats, PublicAlert } from '@/lib/types';

export default function VigilanteDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<PublicPatrolStats | null>(null);
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ activePatrolsToday: number; coveragePercent: number }>('/dashboard/public-stats').catch(() => null),
      api.get<{ data: PublicAlert[] }>('/alerts?status=active&limit=10').catch(() => ({ data: [] })),
    ]).then(([statsRes, alertsRes]) => {
      if (statsRes) {
        setStats({
          activePatrolsToday: statsRes.activePatrolsToday,
          coveragePercent: statsRes.coveragePercent,
          checkinsToday: 0,
          sightingsToday: 0,
        });
      } else {
        setStats({ activePatrolsToday: 0, coveragePercent: 0, checkinsToday: 0, sightingsToday: 0 });
      }
      setAlerts(alertsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('vigilante.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('vigilante.subtitle')}</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
      ) : (
        <>
          <PublicKpiRow stats={stats!} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PublicAlertFeed alerts={alerts} />
            <PublicStats stats={stats!} />
          </div>
        </>
      )}
    </div>
  );
}
