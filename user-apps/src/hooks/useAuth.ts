import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push-subscription';
import type { ResidentSession } from '@/lib/types';

const SESSION_KEY = 'ogbenjuwa_resident_session';

export function createSession(user: { id: string; name: string; lga: string; ward: string }): ResidentSession {
  const session: ResidentSession = {
    id: user.id,
    phone: '',
    role: 'resident',
    name: user.name,
    lga: user.lga,
    ward: user.ward,
    token: '',
    loginAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): ResidentSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: ResidentSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function destroySession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function useAuth() {
  const [session, setSession] = useState<ResidentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(getSession());
    setLoading(false);
  }, []);

  const login = useCallback(async (phone: string, otp: string) => {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: { id: string; name: string; lga: string; ward: string } }>(
      '/auth/phone-login', { phone, otp }, { skipAuth: true }
    );
    sessionStorage.setItem('accessToken', res.accessToken);
    sessionStorage.setItem('refreshToken', res.refreshToken);
    const s = createSession(res.user);
    setSession(s);
    subscribeToPush();
    return s;
  }, []);

  const logout = useCallback(() => {
    unsubscribeFromPush();
    api.clearTokens();
    destroySession();
    setSession(null);
  }, []);

  return { session, loading, isAuthenticated: !!session, login, logout };
}
