import { Shield, Map, Clock, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import type { PublicPatrolStats } from '@/lib/types';

interface Props {
  stats: PublicPatrolStats;
}

export default function PublicKpiRow({ stats }: Props) {
  const { t } = useLanguage();
  const items = [
    { icon: Shield, tKey: 'vigilante.active_patrols', value: stats.activePatrolsToday, color: 'text-green-500' },
    { icon: Map, tKey: 'vigilante.coverage', value: `${stats.coveragePercent}%`, color: 'text-purple-500' },
    { icon: Clock, tKey: 'vigilante.checkins', value: stats.checkinsToday, color: 'text-blue-500' },
    { icon: Eye, tKey: 'vigilante.sightings', value: stats.sightingsToday, color: 'text-amber-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <Card key={item.tKey}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`mt-0.5 ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t(item.tKey)}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
