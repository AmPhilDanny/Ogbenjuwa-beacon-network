import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { api } from '@/lib/api';
import type { ResidentProfile, ResidentPreferences } from '@/lib/types';

function defaultProfile(name: string, phone: string, lga: string, ward: string): ResidentProfile {
  return {
    name,
    phone,
    lga,
    ward,
    verified: true,
    connections: [],
    preferences: { smsAlerts: true, inAppNotifications: true, language: 'en' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function useProfile() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<ResidentProfile>(() =>
    defaultProfile(session?.name ?? '', session?.phone ?? '', session?.lga ?? '', session?.ward ?? '')
  );
  const [snapshot, setSnapshot] = useState<string>('');

  useEffect(() => {
    api.get<{ data: ResidentProfile }>('/users/me/profile')
      .then(res => {
        setProfile(res.data);
        setSnapshot(JSON.stringify(res.data));
      })
      .catch(() => {
        // fallback to defaults
        const def = defaultProfile(session?.name ?? '', session?.phone ?? '', session?.lga ?? '', session?.ward ?? '');
        setProfile(def);
        setSnapshot(JSON.stringify(def));
      });
  }, [session]);

  const isDirty = JSON.stringify(profile) !== snapshot;

  const updateField = useCallback(<K extends keyof ResidentProfile>(key: K, value: ResidentProfile[K]) => {
    setProfile(p => ({ ...p, [key]: value }));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<ResidentPreferences>) => {
    setProfile(p => ({ ...p, preferences: { ...p.preferences, ...prefs } }));
  }, []);

  const save = useCallback(async () => {
    const updated = { ...profile, updatedAt: Date.now() };
    try {
      await api.put('/users/me/profile', updated);
      setProfile(updated);
      setSnapshot(JSON.stringify(updated));
    } catch {
      // fallback: just save locally
      setProfile(updated);
      setSnapshot(JSON.stringify(updated));
    }
    return true;
  }, [profile]);

  const reset = useCallback(() => {
    setProfile(JSON.parse(snapshot));
  }, [snapshot]);

  return { profile, isDirty, updateField, updatePreferences, save, reset };
}
