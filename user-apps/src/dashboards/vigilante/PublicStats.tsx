import { Users, Clock, Map, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import type { PublicPatrolStats } from '@/lib/types';

interface Props {
  stats: PublicPatrolStats;
}

export default function PublicStats({ stats }: Props) {
  const { t } = useLanguage();
  const items = [
    { icon: Users, tKey: 'vigilante.patrol_online', value: `${stats.activePatrolsToday} teams`, color: 'text-green-500' },
    { icon: Clock, tKey: 'vigilante.checkins', value: stats.checkinsToday, color: 'text-blue-500' },
    { icon: Map, tKey: 'vigilante.coverage', value: `${stats.coveragePercent}%`, color: 'text-purple-500' },
    { icon: Eye, tKey: 'vigilante.sightings', value: stats.sightingsToday, color: 'text-amber-500' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t('community.stats_title') || 'Community Stats'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.tKey} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{t(item.tKey)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
