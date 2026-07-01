import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push-subscription';
import type { UserRole, PageId, Session } from '@/lib/types';

const SESSION_KEY = 'ogbenjuwaAuth';

export function createSession(user: { id: string; name: string; role: UserRole; lga: string }): Session {
  const session: Session = {
    id: user.id,
    phone: '',
    role: user.role,
    name: user.name,
    lga: user.lga,
    token: '',
    loginAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
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

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
  api.clearTokens();
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (s) setSession(s);
    setLoading(false);
  }, []);

  const login = useCallback(async (phone: string, otp: string) => {
    const res = await api.post<{ accessToken: string; refreshToken: string; user: { id: string; name: string; role: UserRole; lga: string } }>(
      '/auth/phone-login', { phone, otp }, { skipAuth: true }
    );
    sessionStorage.setItem('accessToken', res.accessToken);
    sessionStorage.setItem('refreshToken', res.refreshToken);
    const s = createSession(res.user);
    setSession(s);
    // Best-effort push subscription
    subscribeToPush();
    return s;
  }, []);

  const logoutSession = useCallback(() => {
    unsubscribeFromPush();
    logout();
    setSession(null);
  }, []);

  const checkAccess = useCallback((page: PageId): boolean => {
    if (!session) return false;
    return true;
  }, [session]);

  const defaultRoute = useCallback((): string => {
    if (!session) return '/login';
    return '/home';
  }, [session]);

  return {
    session,
    loading,
    isAuthenticated: !!session,
    login,
    logout: logoutSession,
    checkAccess,
    defaultRoute: defaultRoute(),
  };
}
