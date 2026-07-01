import { useState, useMemo, useEffect } from 'react';
import { api } from '@/lib/api';
import type { ResidentPublicProfile, ConnectionStatus } from '@/lib/types';
import { useAuth } from './useAuth';

const CONNECTIONS_STORAGE_KEY = 'ogbenjuwa_connections';

function loadConnections(): string[] {
  try {
    const raw = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveConnections(ids: string[]): void {
  try { localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
}

export function useResidents() {
  const { session } = useAuth();
  const [residents, setResidents] = useState<ResidentPublicProfile[]>([]);
  const [connections, setConnections] = useState<string[]>(loadConnections);
  const [search, setSearch] = useState('');
  const [lgaFilter, setLgaFilter] = useState('');

  useEffect(() => {
    api.get<{ data: ResidentPublicProfile[] }>('/residents')
      .then(res => setResidents(res.data))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return residents.filter(r => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.lga.toLowerCase().includes(q)) return false;
      }
      if (lgaFilter && r.lga !== lgaFilter) return false;
      return true;
    });
  }, [search, lgaFilter, residents]);

  const getConnectionStatus = (id: string): ConnectionStatus => {
    if (connections.includes(id)) return 'connected';
    const pending = localStorage.getItem(`pending_${id}`);
    if (pending) return 'pending';
    return 'none';
  };

  const sendRequest = async (id: string) => {
    try {
      await api.post('/connections', { targetUserId: id });
      localStorage.setItem(`pending_${id}`, 'true');
    } catch {
      localStorage.setItem(`pending_${id}`, 'true');
    }
  };

  const acceptRequest = async (id: string) => {
    try {
      await api.put(`/connections/${id}/accept`, {});
    } catch { /* ignore */ }
    localStorage.removeItem(`pending_${id}`);
    const updated = [...connections, id];
    setConnections(updated);
    saveConnections(updated);
  };

  return { residents: filtered, search, setSearch, lgaFilter, setLgaFilter, getConnectionStatus, sendRequest, acceptRequest };
}
