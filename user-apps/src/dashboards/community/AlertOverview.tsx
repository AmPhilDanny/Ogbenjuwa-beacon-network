import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import type { PublicAlert } from '@/lib/types';

interface Props {
  lga: string;
}

const SEVERITY_BADGE: Record<string, 'destructive' | 'secondary' | 'outline'> = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
};

export default function AlertOverview({ lga }: Props) {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lga) {
      setAlerts([]);
      return;
    }
    setLoading(true);
    api.get<{ data: PublicAlert[] }>(`/alerts?lga=${encodeURIComponent(lga)}&limit=20`)
      .then(res => setAlerts(res.data))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, [lga]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {lga ? `${lga} ${t('community.title')?.replace('Dashboard', '').trim() || 'Alerts'}` : t('community.select_lga')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!lga ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">{t('community.select_lga')}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p className="text-sm">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p className="text-sm">{t('vigilante.no_alerts')}</p>
          </div>
        ) : (
          <ScrollArea className="h-[240px]">
            <div className="divide-y">
              {alerts.map(alert => (
                <div key={alert.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{alert.type}</span>
                    <Badge variant={SEVERITY_BADGE[alert.severity] ?? 'outline'} className="text-[10px]">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
