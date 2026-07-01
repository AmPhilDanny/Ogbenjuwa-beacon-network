const API_BASE = 'http://localhost:4001/api/v1';

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

let _enqueueOffline: ((action: unknown) => Promise<void>) | null = null;
async function getEnqueueFn() {
  if (!_enqueueOffline) {
    try {
      const mod = await import('./offline-queue');
      _enqueueOffline = mod.enqueueAction;
    } catch {
      _enqueueOffline = async () => {};
    }
  }
  return _enqueueOffline!;
}

class ApiClient {
  private getToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  }

  private setTokens(access: string, refresh: string): void {
    sessionStorage.setItem('accessToken', access);
    sessionStorage.setItem('refreshToken', refresh);
  }

  clearTokens(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('ogbenjuwa_resident_session');
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    opts?: { skipAuth?: boolean },
  ): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (!opts?.skipAuth) {
      const token = this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status === 401 && !opts?.skipAuth) {
        const refreshed = await this.tryRefresh();
        if (refreshed) return this.request<T>(method, path, body, opts);
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired');
      }

      const text = await res.text();
      let data: T;
      try {
        data = JSON.parse(text);
      } catch {
        throw new ApiClientError('Invalid response from server', 'PARSE_ERROR', res.status);
      }

      if (!res.ok) {
        const err = data as { error?: ApiError };
        throw new ApiClientError(
          err?.error?.message || 'Request failed',
          err?.error?.code || 'UNKNOWN',
          res.status,
          err?.error?.details,
        );
      }

      return data;
    } catch (e) {
      if (e instanceof TypeError && method !== 'GET' && !navigator.onLine) {
        const enqueue = await getEnqueueFn();
        await enqueue({ type: `${method}_${path}`, endpoint: path, method: method as 'POST' | 'PUT' | 'DELETE', body });
        throw new ApiClientError('Request queued — will sync when back online', 'OFFLINE_QUEUED', 0);
      }
      if (e instanceof ApiClientError) throw e;
      throw new ApiClientError(
        e instanceof Error ? e.message : 'Network error',
        'NETWORK_ERROR',
        0,
      );
    }
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(path: string, opts?: { skipAuth?: boolean }): Promise<T> {
    return this.request<T>('GET', path, undefined, opts);
  }

  post<T>(path: string, body?: unknown, opts?: { skipAuth?: boolean }): Promise<T> {
    return this.request<T>('POST', path, body, opts);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const api = new ApiClient();
