import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';

interface AlertItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string | null;
  location: string | null;
  status: string;
  createdAt: string;
}

interface Props {
  lga?: string;
}

const SEVERITY_BADGE: Record<string, 'destructive' | 'secondary' | 'outline'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
};

export default function SmsAlerts({ lga }: Props) {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lga) {
      setAlerts([]);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ limit: '10' });
    api.get<{ data: AlertItem[] }>(`/alerts?${params.toString()}`)
      .then(res => setAlerts(res.data))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, [lga]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          SMS Broadcast History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!lga ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Smartphone className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">{t('community.select_lga')}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p className="text-sm">Loading SMS alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p className="text-sm">No SMS broadcasts yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {alerts.map(alert => (
              <div key={alert.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm capitalize">{alert.type}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={SEVERITY_BADGE[alert.severity] ?? 'outline'} className="text-[10px]">
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                      <Smartphone className="w-3 h-3 mr-0.5" /> SMS
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-foreground">{alert.title}</p>
                {alert.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.description}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {alert.location && `${alert.location} · `}{new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
