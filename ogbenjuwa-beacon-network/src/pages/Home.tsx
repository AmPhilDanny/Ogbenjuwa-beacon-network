import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Users, MapPin, Activity, Phone, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function Home() {
  const { lang } = useLanguage();
  const { session } = useAuth();
  const [stats, setStats] = useState({ activeAlerts: 0, totalUsers: 0, openIncidents: 0 });
  const [activities, setActivities] = useState<{ type: string; title: string; time: string; desc: string }[]>([]);

  useEffect(() => {
    api.get<{ activeAlerts: number; totalUsers: number; openIncidents: number }>('/dashboard/stats')
      .then(setStats)
      .catch(() => {});
    api.get<{ data: any[] }>('/communications?type=announcement')
      .then(res => {
        setActivities((res.data || []).slice(0, 3).map((a: any) => ({
          type: 'info',
          title: a.title || 'Announcement',
          time: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'recent',
          desc: a.content || a.message || '',
        })));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-6 rounded-xl border shadow-sm">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Welcome back, {session?.name || 'Member'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Everything is currently {stats.activeAlerts > 0 ? 'being monitored' : 'secure'} in{' '}
            <span className="font-semibold text-foreground">{session?.lga || 'your area'}</span>.
          </p>
          <div className={cn(
            "flex items-center gap-2 pt-2 text-sm font-medium w-fit px-3 py-1 rounded-full border",
            stats.activeAlerts > 0
              ? "text-amber-600 bg-amber-50 border-amber-100"
              : "text-emerald-600 bg-emerald-50 border-emerald-100"
          )}>
            <Shield className="h-4 w-4" />
            {stats.activeAlerts > 0 ? `${stats.activeAlerts} Active Alert(s)` : 'Active Community Watch'}
          </div>
        </div>
        <div className="shrink-0">
          <img 
            src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/228894b7-b139-4473-b68b-6c204d6010fc/amua-safety-icon-621d61de-1782725748039.webp" 
            alt="Ogbenjuwa Safety Icon" 
            className="h-32 w-32 object-contain drop-shadow-xl"
          />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('home.community_status', lang)}</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts > 0 ? 'Monitoring' : 'Secure'}</div>
            <p className="text-xs text-muted-foreground">
              {stats.openIncidents > 0 ? `${stats.openIncidents} open incidents` : 'All clear'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('home.active_alerts', lang)}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">Active in your area</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('home.neighborhood', lang)}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{t('home.response_time', lang)}</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openIncidents}</div>
            <p className="text-xs text-muted-foreground">Open incidents</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>{t('home.recent_activity', lang)}</CardTitle>
            <CardDescription>Incidents and announcements in your area.</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {activities.map((item, i) => (
                  <div key={i} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className={cn(
                      "h-10 w-10 shrink-0 rounded-full flex items-center justify-center",
                      item.type === 'warning' ? "bg-amber-100 text-amber-600" : 
                      item.type === 'info' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {item.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> : item.type === 'info' ? <Info className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{item.title}</p>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link to="/feed">{t('home.view_all', lang)}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>{t('home.quick_actions', lang)}</CardTitle>
            <CardDescription>Frequently used safety tools.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button className="w-full justify-start gap-3 h-12" variant="outline" asChild>
              <Link to="/report">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {t('home.report_suspicious', lang)}
              </Link>
            </Button>
            <Button className="w-full justify-start gap-3 h-12" variant="outline" asChild>
              <Link to="/neighborhood">
                <Users className="h-5 w-5 text-primary" />
                {t('home.find_neighbor', lang)}
              </Link>
            </Button>
            <Button className="w-full justify-start gap-3 h-12" variant="outline" asChild>
              <Link to="/resources">
                <Phone className="h-5 w-5 text-primary" />
                {t('home.emergency_contacts', lang)}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
