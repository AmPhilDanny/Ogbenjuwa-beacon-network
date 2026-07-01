import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';
import { Bell, Smartphone, Mail, AlertTriangle, Moon, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Preferences {
  smsAlerts: boolean;
  pushAlerts: boolean;
  emailAlerts: boolean;
  criticalOnly: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Preferences>({
    smsAlerts: true,
    pushAlerts: true,
    emailAlerts: false,
    criticalOnly: false,
    quietHoursStart: null,
    quietHoursEnd: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Preferences>('/notification-preferences')
      .then(setPrefs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: keyof Preferences) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/notification-preferences', prefs);
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading preferences...</p>;
  }

  const toggles = [
    { key: 'smsAlerts' as const, label: 'SMS Alerts', desc: 'Receive emergency alerts via SMS', icon: Smartphone, color: 'text-green-500' },
    { key: 'pushAlerts' as const, label: 'Push Notifications', desc: 'Browser push notifications for real-time alerts', icon: Bell, color: 'text-blue-500' },
    { key: 'emailAlerts' as const, label: 'Email Notifications', desc: 'Daily digest and critical alerts via email', icon: Mail, color: 'text-purple-500' },
    { key: 'criticalOnly' as const, label: 'Critical Only', desc: 'Only receive notifications for critical-severity alerts', icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold">Notification Preferences</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage how you receive alerts</p>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" /> Notification Channels</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {toggles.map(t => (
              <div key={t.key} className="flex items-center justify-between py-2">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center mt-0.5 ${t.color}`}>
                    <t.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={prefs[t.key]} onChange={() => toggle(t.key)} className="sr-only peer" />
                  <div className="w-10 h-5 bg-muted rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Moon className="w-4 h-4" /> Quiet Hours</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Suppress non-critical notifications during these hours.</p>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Start</label>
                <input
                  type="time"
                  value={prefs.quietHoursStart || ''}
                  onChange={e => setPrefs(p => ({ ...p, quietHoursStart: e.target.value || null }))}
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
                />
              </div>
              <span className="text-muted-foreground mt-5">—</span>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">End</label>
                <input
                  type="time"
                  value={prefs.quietHoursEnd || ''}
                  onChange={e => setPrefs(p => ({ ...p, quietHoursEnd: e.target.value || null }))}
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
