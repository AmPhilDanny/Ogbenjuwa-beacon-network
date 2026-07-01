import { useEffect, useState } from 'react';
import { Bell, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import type { ResidentPreferences } from '@/lib/types';

interface Props {
  preferences: ResidentPreferences;
  onUpdate: (prefs: Partial<ResidentPreferences>) => void;
}

export default function NotificationPrefs({ preferences, onUpdate }: Props) {
  const { t } = useLanguage();

  const handleToggle = async (key: keyof ResidentPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    try {
      await api.put('/notification-preferences', updated);
      onUpdate(updated);
    } catch { /* silent fallback */ }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{t('profile.notifications')}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Smartphone className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <Label className="font-medium">{t('profile.sms_alerts')}</Label>
              <p className="text-xs text-muted-foreground">{t('profile.sms_desc') || 'Receive SMS alerts for incidents in your area'}</p>
            </div>
          </div>
          <Switch checked={preferences.smsAlerts} onCheckedChange={c => onUpdate({ smsAlerts: c })} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Bell className="h-4 w-4 text-muted-foreground mt-1" />
            <div>
              <Label className="font-medium">{t('profile.in_app')}</Label>
              <p className="text-xs text-muted-foreground">{t('profile.in_app_desc') || 'Get push notifications within the app'}</p>
            </div>
          </div>
          <Switch checked={preferences.inAppNotifications} onCheckedChange={c => onUpdate({ inAppNotifications: c })} />
        </div>
      </CardContent>
    </Card>
  );
}
