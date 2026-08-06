import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/push-subscription';
import type { UserRole, PageId, Session } from '@/lib/types';

const SESSION_KEY = 'ogbenjuwaAuth';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    role: UserRole;
    roleLabel?: string;
    lga?: string;
    ward?: string;
    village?: string;
    lgaId?: string;
    wardId?: string;
    villageId?: string;
  };
}

// 2FA (OTP) DISABLED — server /auth/login returns tokens directly. To re-enable,
// restore the OTP branch in central-command/server/routes/auth.ts and uncomment
// the types/helpers/functions below plus the phone/OTP UI in Login.tsx.
// interface OtpRequiredResponse {
//   requiresOtp: true;
//   phone: string;
//   message: string;
// }

// type LoginResponse = AuthResponse | OtpRequiredResponse;

// function isOtpRequired(r: LoginResponse): r is OtpRequiredResponse {
//   return 'requiresOtp' in r && r.requiresOtp === true;
// }

export function createSession(user: {
  id: string;
  name: string;
  role: UserRole;
  lga?: string;
  ward?: string;
  village?: string;
  lgaId?: string;
  wardId?: string;
  villageId?: string;
  roleLabel?: string;
}): Session {
  const session: Session = {
    id: user.id,
    phone: '',
    role: user.role,
    roleLabel: user.roleLabel,
    name: user.name,
    lga: user.lga ?? '',
    ward: user.ward,
    village: user.village,
    lgaId: user.lgaId,
    wardId: user.wardId,
    villageId: user.villageId,
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

  // 2FA (OTP) DISABLED — phone-number OTP login removed.
  // const login = useCallback(async (phone: string, otp: string) => {
  //   const res = await api.post<{ accessToken: string; refreshToken: string; user: { id: string; name: string; role: UserRole; lga: string } }>(
  //     '/auth/phone-login', { phone, otp }, { skipAuth: true }
  //   );
  //   sessionStorage.setItem('accessToken', res.accessToken);
  //   sessionStorage.setItem('refreshToken', res.refreshToken);
  //   const s = createSession(res.user);
  //   setSession(s);
  //   subscribeToPush();
  //   return s;
  // }, []);

  const loginWithCredentials = useCallback(async (loginVal: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { login: loginVal, password }, { skipAuth: true });
    sessionStorage.setItem('accessToken', res.accessToken);
    sessionStorage.setItem('refreshToken', res.refreshToken);
    const s = createSession(res.user);
    setSession(s);
    subscribeToPush();
    return res;
  }, []);

  // 2FA (OTP) DISABLED — OTP verification step removed.
  // const verifyOtp = useCallback(async (phone: string, otp: string) => {
  //   const res = await api.post<AuthResponse>('/auth/verify-otp', { phone, otp }, { skipAuth: true });
  //   sessionStorage.setItem('accessToken', res.accessToken);
  //   sessionStorage.setItem('refreshToken', res.refreshToken);
  //   const s = createSession(res.user);
  //   setSession(s);
  //   subscribeToPush();
  //   return s;
  // }, []);

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
    // 2FA (OTP) DISABLED — login (phone-login) and verifyOtp removed.
    loginWithCredentials,
    logout: logoutSession,
    checkAccess,
    defaultRoute: defaultRoute(),
  };
}
