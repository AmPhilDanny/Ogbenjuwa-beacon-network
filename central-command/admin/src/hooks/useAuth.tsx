import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { AuthResponse, Role } from '../lib/types';

interface OtpRequired {
  requiresOtp: true;
  phone: string;
  message: string;
}

type LoginResult = AuthResponse | OtpRequired;

interface AuthState {
  user: { id: string; email: string; name: string; role: Role; lgaId?: string | null; avatar?: string | null } | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (login: string, password: string) => Promise<LoginResult>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get<{ id: string; email: string; name: string; role: Role; lgaId?: string | null; avatar?: string | null }>('/auth/me')
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (loginVal: string, password: string): Promise<LoginResult> => {
    const data = await api.post<LoginResult>('/auth/login', { login: loginVal, password }, { skipAuth: true });

    if ('requiresOtp' in data && data.requiresOtp) {
      return data;
    }

    const authData = data as AuthResponse;
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    setUser(authData.user);
    return authData;
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    const data = await api.post<AuthResponse>('/auth/verify-otp', { phone, otp }, { skipAuth: true });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
