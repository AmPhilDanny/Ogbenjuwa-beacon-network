import { AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/lib/i18n';
import type { PublicAlert } from '@/lib/types';

const SEVERITY_COLOR: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};

const SEVERITY_BADGE: Record<string, 'destructive' | 'secondary' | 'outline'> = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
};

interface Props {
  alerts: PublicAlert[];
}

export default function PublicAlertFeed({ alerts }: Props) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {t('vigilante.alert_log')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[260px]">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">{t('vigilante.no_alerts')}</p>
            </div>
          ) : (
            <div className="divide-y">
              {alerts.map(alert => (
                <div key={alert.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${SEVERITY_COLOR[alert.severity] ?? 'bg-gray-400'}`} />
                      <span className="font-medium text-sm truncate">{alert.type}</span>
                    </div>
                    <Badge variant={SEVERITY_BADGE[alert.severity] ?? 'outline'} className="text-[10px] h-4 px-1.5">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-4">{alert.description}</p>
                  <div className="flex items-center gap-2 mt-1 ml-4">
                    <Badge variant="outline" className="text-[10px]">{alert.lga}</Badge>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {alert.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
