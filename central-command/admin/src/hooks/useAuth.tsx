import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { AuthResponse, Role } from '../lib/types';

// 2FA (OTP) DISABLED — server /auth/login now returns tokens directly for all
// roles. To re-enable 2FA, restore the OTP branch in
// central-command/server/routes/auth.ts and uncomment OtpRequired/verifyOtp below.
// interface OtpRequired {
//   requiresOtp: true;
//   phone: string;
//   message: string;
// }

// type LoginResult = AuthResponse | OtpRequired;

interface AuthState {
  user: { id: string; email: string; name: string; role: Role; lgaId?: string | null; avatar?: string | null } | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (login: string, password: string) => Promise<AuthResponse>;
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

  const login = useCallback(async (loginVal: string, password: string): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>('/auth/login', { login: loginVal, password }, { skipAuth: true });

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    return data;
  }, []);

  // 2FA (OTP) DISABLED — OTP verification step removed.
  // const verifyOtp = useCallback(async (phone: string, otp: string) => {
  //   const data = await api.post<AuthResponse>('/auth/verify-otp', { phone, otp }, { skipAuth: true });
  //   localStorage.setItem('accessToken', data.accessToken);
  //   localStorage.setItem('refreshToken', data.refreshToken);
  //   setUser(data.user);
  // }, []);

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
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
