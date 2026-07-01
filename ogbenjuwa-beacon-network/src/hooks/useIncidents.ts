import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Incident {
  id: string;
  type: 'alert' | 'announcement' | 'incident' | 'info';
  title: string;
  author: string;
  location: string;
  time: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: number;
}

function mapAlertToIncident(alert: any): Incident {
  return {
    id: alert.id,
    type: 'alert',
    title: alert.title || 'Untitled Alert',
    author: alert.reportedBy || 'System',
    location: alert.location || alert.lgaId || 'Unknown',
    time: alert.createdAt ? formatTimeAgo(new Date(alert.createdAt)) : 'recently',
    content: alert.description || alert.title || '',
    severity: alert.severity || 'medium',
    createdAt: alert.createdAt ? new Date(alert.createdAt).getTime() : Date.now(),
  };
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ data: any[] }>('/alerts').catch(() => ({ data: [] })),
      api.get<{ data: any[] }>('/communications?type=announcement').catch(() => ({ data: [] })),
    ]).then(([alertsRes, announcementsRes]) => {
      const mapped: Incident[] = [
        ...(alertsRes.data || []).map(mapAlertToIncident),
        ...(announcementsRes.data || []).map((a: any) => ({
          id: a.id,
          type: 'announcement' as const,
          title: a.title || 'Announcement',
          author: a.createdBy || 'Admin',
          location: a.lgaId || 'All LGAs',
          time: a.createdAt ? formatTimeAgo(new Date(a.createdAt)) : 'recently',
          content: a.content || a.message || '',
          severity: 'low' as const,
          createdAt: a.createdAt ? new Date(a.createdAt).getTime() : Date.now(),
        })),
      ];
      mapped.sort((a, b) => b.createdAt - a.createdAt);
      setIncidents(mapped);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return { incidents, loading };
}
