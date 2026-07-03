import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, KeyRound, ChevronRight, AlertCircle, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { getSiteSettings } from '@/lib/site-settings';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { loginWithCredentials, isAuthenticated } = useAuth();
  const brand = getSiteSettings();

  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/vigilante-dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithCredentials(loginField, password);
      toast.success(t('general.welcome') || 'Welcome!');
      navigate('/vigilante-dashboard', { replace: true });
    } catch (err) {
      setError((err as Error).message || 'Invalid email/username or password');
    } finally {
      setLoading(false);
    }
  }, [loginField, password, loginWithCredentials, navigate, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ogbenjuwa-ink p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: brand?.primaryColor || '#059669' }}>
            {brand?.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.siteName} className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <Shield className="h-8 w-8 text-white" />
            )}
          </div>
          <h1 className="font-serif text-3xl font-bold text-white">{brand?.siteName || 'Ogbenjuwa'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{brand?.tagline || (t('auth.subtitle') || 'Citizen Portal')}</p>
        </div>

        <Card className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink-mid/50">
          <CardHeader>
            <CardTitle className="text-center text-white">Sign in</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your email or username and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login" className="text-white">Email or Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login"
                    className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink pl-9 text-white"
                    placeholder="email@example.com or username"
                    value={loginField}
                    onChange={(e) => { setLoginField(e.target.value); setError(''); }}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink pl-9 text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <p className="flex items-center gap-1 text-xs text-ogbenjuwa-red">
                  <AlertCircle className="h-3 w-3" /> {error}
                </p>
              )}
              <Button type="submit" disabled={loading} className="w-full gap-2 bg-ogbenjuwa-green-mid text-white hover:bg-ogbenjuwa-green-mid/90">
                {loading ? 'Signing in...' : 'Sign in'} <ChevronRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-ogbenjuwa-green-mid hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {(brand?.siteName || 'Ogbenjuwa')} v0.1.0 &mdash; Idoma Region, Benue State, Nigeria
        </p>
      </div>
    </div>
  );
}
