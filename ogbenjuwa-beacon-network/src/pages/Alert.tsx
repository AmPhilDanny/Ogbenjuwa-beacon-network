import { useCallback, useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertCircle, Bell, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertMap } from '@/components/alert/AlertMap';
import { SOSButton } from '@/components/alert/SOSButton';
import { SMSFeed, type SMSItem } from '@/components/alert/SMSFeed';
import { USSDScreen } from '@/components/alert/USSDScreen';
import { AlertStats } from '@/components/alert/AlertStats';
import { api } from '@/lib/api';
import { sleep, formatTimer } from '@/lib/utils';
import type { AlertTypeId, SeverityLevel } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

const IDOMA_CENTRE: [number, number] = [7.15, 8.13];

interface AlertType {
  id: string;
  label: string;
  idoma: string;
  icon: string;
  color: string;
  sms: string;
}

interface Village {
  name: string;
  lga: string;
  lat: number;
  lng: number;
  pop: number;
  lgaId: string;
}

interface Contact {
  name: string;
  initials: string;
  phone: string;
  village: string;
}

// ─── Map Controller ─────────────────────────────────────────────────────
function AlertMapController({
  epicentre,
  isAlerting,
  activeAlertType,
  targetVillage,
  villages,
  alertTypes,
}: {
  epicentre: [number, number] | null;
  isAlerting: boolean;
  activeAlertType: AlertTypeId | null;
  targetVillage: string | null;
  villages: Village[];
  alertTypes: AlertType[];
}) {
  const map = useMap();
  const epicentreRef = useRef<L.CircleMarker | null>(null);
  const radiusRef = useRef<L.Circle | null>(null);

  // Flash village markers
  useEffect(() => {
    if (!isAlerting || !targetVillage) return;
    const village = villages.find((v) => v.name === targetVillage);
    if (!village) return;

    let flashPhase = 0;
    const interval = setInterval(() => {
      flashPhase = 1 - flashPhase;
      map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) {
          const ll = layer.getLatLng();
          if (Math.abs(ll.lat - village.lat) < 0.01 && Math.abs(ll.lng - village.lng) < 0.01) {
            if (flashPhase === 1) {
              layer.setStyle({ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.5 });
            } else {
              layer.setStyle({ color: '#2D9B57', fillColor: '#2D9B57', fillOpacity: 0.3 });
            }
          }
        }
      });
    }, 800);

    return () => {
      clearInterval(interval);
      map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) {
          layer.setStyle({ color: '#2D9B57', fillColor: '#2D9B57', fillOpacity: 0.3, weight: 2 });
        }
      });
    };
  }, [isAlerting, targetVillage, map, villages]);

  // Drop epicentre + radius circle + fly to
  useEffect(() => {
    if (!epicentre) {
      if (epicentreRef.current) { map.removeLayer(epicentreRef.current); epicentreRef.current = null; }
      if (radiusRef.current) { map.removeLayer(radiusRef.current); radiusRef.current = null; }
      return;
    }

    const alertType = alertTypes.find((a) => a.id === activeAlertType);
    const emoji = alertType?.icon || '⚠️';

    const icon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:${alertType?.color || '#DC2626'};border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 20px rgba(220,38,38,0.6);">${emoji}</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    epicentreRef.current = L.circleMarker(epicentre, {
      radius: 8,
      color: alertType?.color || '#DC2626',
      fillColor: alertType?.color || '#DC2626',
      fillOpacity: 0.8,
      weight: 2,
    }).addTo(map);
    L.marker(epicentre, { icon }).addTo(map);

    radiusRef.current = L.circle(epicentre, {
      radius: 25000,
      color: '#DC2626',
      fillColor: '#DC2626',
      fillOpacity: 0.05,
      weight: 2,
      dashArray: '8, 8',
    }).addTo(map);

    const village = villages.find((v) => v.name === targetVillage);
    if (village) {
      map.flyTo([village.lat, village.lng], 11, { duration: 1.2 });
    }

    return () => {
      if (epicentreRef.current) map.removeLayer(epicentreRef.current);
      if (radiusRef.current) map.removeLayer(radiusRef.current);
    };
  }, [epicentre, activeAlertType, targetVillage, map, villages, alertTypes]);

  return null;
}

// ─── Alert Page ──────────────────────────────────────────────────────────
export default function Alert() {
  const { lang } = useLanguage();
  const [alertTypes, setAlertTypes] = useState<AlertType[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [alertType, setAlertType] = useState<AlertTypeId>('attack');
  const [village, setVillage] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('high');

  // Alert state
  const [isTriggered, setIsTriggered] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  const [timerMs, setTimerMs] = useState(0);
  const [smsItems, setSmsItems] = useState<SMSItem[]>([]);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [ussdStep, setUssdStep] = useState(0);
  const [epicentre, setEpicentre] = useState<[number, number] | null>(null);
  const [activeAlertType, setActiveAlertType] = useState<AlertTypeId | null>(null);
  const [targetVillage, setTargetVillage] = useState<string | null>(null);

  const firingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ data: any[] }>('/alert-types').catch(() => ({ data: [] })),
      api.get<{ data: any[] }>('/villages').catch(() => ({ data: [] })),
      api.get<{ data: any[] }>('/contacts?type=emergency').catch(() => ({ data: [] })),
      api.get<{ data: any[] }>('/lgas').catch(() => ({ data: [] })),
    ]).then(([typesRes, villagesRes, contactsRes, lgasRes]) => {
      const mappedTypes: AlertType[] = typesRes.data.map((t: any) => ({
        id: t.key,
        label: t.label,
        idoma: t.labelIdoma || t.label,
        icon: t.icon || '⚠️',
        color: t.color || '#6B7280',
        sms: t.smsTemplate || `OGBENJUWA ALERT: ${t.label} reported in {v}. Remain vigilant. Report to *347#`,
      }));
      setAlertTypes(mappedTypes);

      const lgaMap: Record<string, string> = {};
      lgasRes.data.forEach((l: any) => { lgaMap[l.name] = l.id; });

      const mappedVillages: Village[] = villagesRes.data.map((v: any) => ({
        name: v.name,
        lga: lgaMap[v.lgaId] ? Object.keys(lgaMap).find(k => lgaMap[k] === v.lgaId) || '' : '',
        lat: Number(v.lat) || 0,
        lng: Number(v.lng) || 0,
        pop: v.population || 0,
        lgaId: v.lgaId,
      }));
      setVillages(mappedVillages);

      const mappedContacts: Contact[] = contactsRes.data.map((c: any) => ({
        name: c.name,
        initials: (c.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?',
        phone: c.phone,
        village: c.village || '',
      }));
      setContacts(mappedContacts);

      if (mappedVillages.length > 0) {
        setVillage(mappedVillages[0].name);
      }
    }).finally(() => setLoading(false));
  }, []);

  // USSD auto-cycle
  useEffect(() => {
    if (!isTriggered) return;
    const interval = setInterval(() => {
      setUssdStep((s) => (s + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, [isTriggered]);

  // Timer
  useEffect(() => {
    if (!isTriggered) {
      setTimerMs(0);
      return;
    }
    const start = Date.now() - timerMs;
    timerRef.current = setInterval(() => {
      setTimerMs(Date.now() - start);
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTriggered]);

  const currentAlertType = alertTypes.find((a) => a.id === alertType);
  const smsPreview = currentAlertType?.sms?.replace('{v}', village) || '';

  const computeInitials = (name: string): string =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  // ── triggerAlert ───────────────────────────────────────────────────────
  const triggerAlert = useCallback(async () => {
    if (firingRef.current) return;
    firingRef.current = true;

    const selectedVillage = villages.find((v) => v.name === village);
    if (!selectedVillage) { firingRef.current = false; return; }

    setIsTriggered(true);
    setIsAlerting(true);
    setActiveAlertType(alertType);
    setTargetVillage(village);
    setEpicentre([selectedVillage.lat, selectedVillage.lng]);

    try {
      const alertPayload: Record<string, unknown> = {
        type: alertType,
        severity,
        title: `${alertType.toUpperCase()} Alert — ${village}`,
        description: currentAlertType?.sms?.replace('{v}', village) || `${alertType} reported in ${village}`,
        lgaId: selectedVillage.lgaId,
        location: village,
        isPublic: true,
      };
      const alertRes = await api.post<any>('/alerts', alertPayload);
      const alertId = alertRes?.id;

      const smsRes = await api.post<{
        mode: string;
        delivered?: number;
        failed?: number;
        total?: number;
        logs: Array<{
          id: string;
          recipientPhone: string;
          recipientName: string | null;
          message: string;
          status: string;
        }>;
      }>('/sms/simulate', {
        alertId,
        mode: 'sms',
        message: currentAlertType?.sms?.replace('{v}', village) || undefined,
      });

      if (smsRes.logs) {
        let delivered = 0;
        const items: SMSItem[] = smsRes.logs.map(log => {
          if (log.status === 'delivered') delivered++;
          const contact = contacts.find(c => c.phone === log.recipientPhone);
          return {
            name: log.recipientName || contact?.name || log.recipientPhone,
            initials: contact?.initials || computeInitials(log.recipientName || log.recipientPhone),
            phone: log.recipientPhone,
            village: contact?.village || '',
            message: log.message,
            delivered: log.status === 'delivered',
          };
        });
        setSmsItems(items);
        setDeliveredCount(delivered);
      }
    } catch {
      let delivered = 0;
      const items: SMSItem[] = contacts.map(contact => {
        delivered++;
        return {
          name: contact.name,
          initials: contact.initials,
          phone: contact.phone,
          village: contact.village,
          message: currentAlertType?.sms?.replace('{v}', village) || '',
          delivered: true,
        };
      });
      setSmsItems(items);
      setDeliveredCount(delivered);
    }

    setIsAlerting(false);
    firingRef.current = false;
  }, [alertType, severity, village, villages, contacts, currentAlertType]);

  const resetAlert = useCallback(() => {
    setIsTriggered(false);
    setIsAlerting(false);
    setTimerMs(0);
    setSmsItems([]);
    setDeliveredCount(0);
    setUssdStep(0);
    setEpicentre(null);
    setActiveAlertType(null);
    setTargetVillage(null);
    firingRef.current = false;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading alert system...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t('alert.system', lang)}</h1>
        <p className="text-muted-foreground">
          Emergency broadcast — {isTriggered ? t('alert.in_progress', lang) : t('alert.standing_by', lang)}
        </p>
      </header>

      {/* Stats Bar */}
      <AlertStats
        registered={contacts.length}
        lgaNodes={9}
        delivered={deliveredCount}
        lastTime={isTriggered ? formatTimer(timerMs) : '--:--'}
      />

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── LEFT: Controls ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Alert Type Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t('alert.type', lang)}
              </CardTitle>
              <CardDescription>Select the type of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {alertTypes.filter((t) => t.id !== 'other').map((at) => (
                <button
                  key={at.id}
                  onClick={() => setAlertType(at.id as AlertTypeId)}
                  disabled={isTriggered}
                  className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    alertType === at.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } ${isTriggered ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="text-xl">{at.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{at.label}</p>
                    <p className="text-xs text-muted-foreground">{at.idoma}</p>
                  </div>
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: at.color }} />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Village + Severity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('alert.location', lang)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('alert.village_lga', lang)}</label>
                <Select value={village} onValueChange={setVillage} disabled={isTriggered}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((v) => (
                      <SelectItem key={v.name} value={v.name}>
                        {v.name} — {v.lga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{t('alert.severity', lang)}</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((s) => (
                    <Badge
                      key={s}
                      variant={severity === s ? 'default' : 'outline'}
                      className={`cursor-pointer capitalize ${
                        severity === s
                          ? s === 'high' ? 'bg-red-600' : s === 'medium' ? 'bg-amber-600' : 'bg-green-600'
                          : ''
                      }`}
                      onClick={() => !isTriggered && setSeverity(s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* USSD Mockup */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">USSD Simulation</CardTitle>
              <CardDescription>Dial *347# to activate</CardDescription>
            </CardHeader>
            <CardContent>
              <USSDScreen step={ussdStep} />
            </CardContent>
          </Card>

          {/* SMS Preview */}
          {!isTriggered && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('alert.sms_preview', lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed bg-muted/30 p-3 rounded-lg">
                  {smsPreview}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Or send SMS: <span className="font-mono">ALERT {currentAlertType?.idoma.toUpperCase() || ''} {village.slice(0, 3).toUpperCase()}001</span> to <span className="font-mono">347</span>
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── CENTRE: SOS + Map ──────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              {isTriggered ? (
                <div className="text-center space-y-4">
                  <SOSButton onActivate={triggerAlert} disabled={true} />
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-red-500">{t('alert.active', lang)}</p>
                    <p className="text-sm text-muted-foreground">
                      {isAlerting ? t('alert.broadcasting', lang) : t('alert.notified', lang)}
                    </p>
                    <p className="font-mono text-2xl font-bold tabular-nums">{formatTimer(timerMs)}</p>
                    <div className="progress-track max-w-xs mx-auto mt-2">
                      <div className="progress-fill" style={{ width: `${(deliveredCount / Math.max(contacts.length, 1)) * 100}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {deliveredCount}/{contacts.length} {t('alert.warriors', lang)}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={resetAlert} className="mt-2">
                    {t('alert.reset', lang)}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <SOSButton onActivate={triggerAlert} />
                  <p className="text-sm text-muted-foreground">
                    {t('alert.sos', lang)} — broadcast emergency alert
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('dashboard.heatmap', lang)}
              </CardTitle>
              <CardDescription>Idoma Region — {villages.length} villages monitored</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] w-full">
                <AlertMap villages={villages}>
                  <AlertMapController
                    epicentre={epicentre}
                    isAlerting={isAlerting}
                    activeAlertType={activeAlertType}
                    targetVillage={targetVillage}
                    villages={villages}
                    alertTypes={alertTypes}
                  />
                </AlertMap>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── RIGHT: SMS Feed ────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                {t('alert.broadcast_feed', lang)}
              </CardTitle>
              <CardDescription>
                {isTriggered
                  ? `${deliveredCount} of ${contacts.length} messages sent`
                  : t('alert.waiting', lang)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[520px] overflow-y-auto px-4 pb-4">
                <SMSFeed items={smsItems} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
