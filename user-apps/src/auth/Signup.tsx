import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ChevronRight, AlertCircle, User, Mail, KeyRound, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { getSiteSettings } from '@/lib/site-settings';
import { api } from '@/lib/api';

interface FieldError {
  field: string;
  message: string;
}

export default function Signup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const brand = getSiteSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/vigilante-dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = (): boolean => {
    const errors: FieldError[] = [];
    if (!name.trim()) errors.push({ field: 'name', message: 'Full name is required' });
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.push({ field: 'email', message: 'Valid email is required' });
    if (!username.trim() || username.length < 3) errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
    if (!password || password.length < 8) errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    if (password !== confirmPassword) errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    setFieldErrors(errors);
    return errors.length === 0;
  };

  const getFieldError = (field: string) => fieldErrors.find(e => e.field === field)?.message;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        password,
        name: name.trim(),
        phone: phone.trim() || undefined,
      }, { skipAuth: true });
      toast.success('Account created! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err: any) {
      if (err?.code === 'ACCOUNT_EXISTS') {
        setError('An account with this email or username already exists');
      } else {
        setError(err?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, username, password, name, phone, validate, navigate]);

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
            <CardTitle className="text-center text-white">Create Account</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Register as a community member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="flex items-center gap-1 text-xs text-ogbenjuwa-red bg-ogbenjuwa-red/10 p-2 rounded">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" /> {error}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink pl-9 text-white"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFieldErrors(fieldErrors.filter(f => f.field !== 'name')); }}
                    required
                  />
                </div>
                {getFieldError('name') && <p className="text-xs text-ogbenjuwa-red">{getFieldError('name')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink pl-9 text-white"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(fieldErrors.filter(f => f.field !== 'email')); }}
                    required
                  />
                </div>
                {getFieldError('email') && <p className="text-xs text-ogbenjuwa-red">{getFieldError('email')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink pl-9 text-white"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '')); setFieldErrors(fieldErrors.filter(f => f.field !== 'username')); }}
                    required
                  />
                </div>
                {getFieldError('username') && <p className="text-xs text-ogbenjuwa-red">{getFieldError('username')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink pl-9 font-mono text-white"
                    placeholder="+234 803 441 2290"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(fieldErrors.filter(f => f.field !== 'password')); }}
                    required
                  />
                </div>
                {getFieldError('password') && <p className="text-xs text-ogbenjuwa-red">{getFieldError('password')}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink pl-9 text-white"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(fieldErrors.filter(f => f.field !== 'confirmPassword')); }}
                    required
                  />
                </div>
                {getFieldError('confirmPassword') && <p className="text-xs text-ogbenjuwa-red">{getFieldError('confirmPassword')}</p>}
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2 bg-ogbenjuwa-green-mid text-white hover:bg-ogbenjuwa-green-mid/90">
                {loading ? 'Creating account...' : 'Create Account'} <ChevronRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-ogbenjuwa-green-mid hover:underline font-medium">
                  Sign in
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
