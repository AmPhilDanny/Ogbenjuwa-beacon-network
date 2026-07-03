import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api, ApiClientError } from '../lib/api';

type Step = 'credentials' | 'otp';

export default function Login() {
  const { login, verifyOtp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [brand, setBrand] = useState<{ siteName?: string; logoUrl?: string | null }>({});

  useEffect(() => {
    api.get<{ siteName: string; logoUrl: string | null }>('/settings', { skipAuth: true })
      .then(setBrand)
      .catch(() => {});
  }, []);

  const [step, setStep] = useState<Step>('credentials');
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleCredentialsSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(loginField, password);
      if ('requiresOtp' in result && result.requiresOtp) {
        setOtpPhone(result.phone);
        setStep('otp');
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(otpPhone, otp);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
      setOtp('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {brand?.logoUrl && <img src={brand.logoUrl} alt={brand.siteName} className="mx-auto h-12 w-12 rounded-xl mb-3 object-contain" />}
          <h1 className="text-4xl text-primary font-serif mb-2">{brand?.siteName || 'Ogbenjuwa'}</h1>
          <p className="text-sidebar-foreground/60 text-sm">Central Command Deck</p>
        </div>

        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="bg-card rounded-lg border border-border p-8 shadow-xl">
            <h2 className="text-xl font-medium text-card-foreground mb-6">Sign in</h2>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-accent/10 border border-accent/20 text-accent text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="login" className="block text-sm font-medium text-card-foreground mb-1">Email or Username</label>
                <input
                  id="login"
                  type="text"
                  value={loginField}
                  onChange={(e) => setLoginField(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  placeholder="email@example.com or username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="bg-card rounded-lg border border-border p-8 shadow-xl">
            <h2 className="text-xl font-medium text-card-foreground mb-6">Two-Factor Verification</h2>
            <p className="text-sm text-card-foreground/70 mb-4">
              An OTP has been sent to your registered phone number.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-accent/10 border border-accent/20 text-accent text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-card-foreground mb-1">OTP Code</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Sign in'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                className="w-full py-2 text-sm text-card-foreground/60 hover:text-card-foreground transition-colors"
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
