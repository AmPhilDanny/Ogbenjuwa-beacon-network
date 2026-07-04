import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Phone, Mail, KeyRound, ChevronRight, ChevronLeft, AlertCircle, Clock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { getSiteSettings } from '@/lib/site-settings';
import { ApiClientError } from '@/lib/api';

const PHONE_REGEX = /^\+234[789][01]\d{8}$/;

type AuthMethod = 'credentials' | 'phone';
type Step = 'credentials' | 'phone' | 'otp';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useLanguage();
  const { login: phoneLogin, loginWithCredentials, verifyOtp, isAuthenticated } = useAuth();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || (isAuthenticated ? '/home' : '/');
  const brand = getSiteSettings();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('credentials');
  const [step, setStep] = useState<Step>('credentials');

  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [credError, setCredError] = useState('');
  const [credLoading, setCredLoading] = useState(false);

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleCredentialsSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError('');
    setCredLoading(true);
    try {
      const result = await loginWithCredentials(loginField, password);
      if ('requiresOtp' in result && result.requiresOtp) {
        setOtpPhone(result.phone);
        setStep('otp');
        toast.success('OTP sent to your registered phone');
      } else {
        toast.success('Welcome!');
        // useEffect handles navigation when isAuthenticated changes
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setCredError(err.message);
      } else {
        setCredError('Login failed. Please try again.');
      }
    } finally {
      setCredLoading(false);
    }
  }, [loginField, password, loginWithCredentials, navigate, from]);

  const handlePhoneSubmit = useCallback(() => {
    const cleaned = phone.trim();
    if (!PHONE_REGEX.test(cleaned)) {
      setPhoneError('Enter a valid Nigerian number: +234 803 XXX XXXX');
      return;
    }
    setPhoneError('');
    toast.success('OTP sent to ' + cleaned);
    setStep('otp');
  }, [phone]);

  const handleOTPComplete = useCallback(async (value: string) => {
    if (lockedUntil && Date.now() < lockedUntil) return;
    setSubmitting(true);
    const targetPhone = step === 'phone' ? phone : otpPhone;
    try {
      if (step === 'phone') {
        await phoneLogin(targetPhone, value);
      } else {
        await verifyOtp(targetPhone, value);
      }
      toast.success('Welcome!');
      // useEffect handles navigation when isAuthenticated changes
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setOtpValue('');
      if (newAttempts >= 3) {
        setLockedUntil(Date.now() + 15 * 60 * 1000);
        toast.error('Too many attempts. Locked for 15 minutes.');
      } else {
        const msg = err instanceof ApiClientError ? err.message : 'Wrong code';
        setError(msg);
        toast.error(`Wrong code. Attempt ${newAttempts} of 3.`);
      }
    } finally {
      setSubmitting(false);
    }
  }, [attempts, lockedUntil, phone, otpPhone, step, phoneLogin, verifyOtp, navigate, from]);

  const formatLockout = () => {
    if (!lockedUntil) return '';
    const remaining = Math.max(0, Math.floor((lockedUntil - Date.now()) / 1000));
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const switchMethod = (method: AuthMethod) => {
    setAuthMethod(method);
    setStep(method);
    setError('');
    setCredError('');
    setPhoneError('');
    setOtpValue('');
  };

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
          {brand?.tagline && <p className="mt-1 text-sm text-muted-foreground">{brand.tagline}</p>}
        </div>

        {step !== 'otp' && (
          <div className="mb-4 flex rounded-lg border border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink-mid/30 p-1">
            <button
              onClick={() => switchMethod('credentials')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                authMethod === 'credentials' ? 'bg-ogbenjuwa-green-mid text-white' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Mail className="h-4 w-4" /> Email/Username
            </button>
            <button
              onClick={() => switchMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                authMethod === 'phone' ? 'bg-ogbenjuwa-green-mid text-white' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <Phone className="h-4 w-4" /> Phone
            </button>
          </div>
        )}

        <Card className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink-mid/50">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {step === 'credentials' && 'Sign in'}
              {step === 'phone' && t('auth.login', lang)}
              {step === 'otp' && t('auth.enter_otp', lang)}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {step === 'credentials' && 'Enter your email or username and password'}
              {step === 'phone' && 'Enter your Nigerian phone number to receive a one-time code'}
              {step === 'otp' && `Verification code sent`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login" className="text-white">Email or Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login"
                      className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink pl-9 text-white"
                      placeholder="email@example.com or username"
                      value={loginField}
                      onChange={(e) => { setLoginField(e.target.value); setCredError(''); }}
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

                {credError && (
                  <p className="flex items-center gap-1 text-xs text-ogbenjuwa-red">
                    <AlertCircle className="h-3 w-3" /> {credError}
                  </p>
                )}

                <Button type="submit" disabled={credLoading} className="w-full gap-2 bg-ogbenjuwa-green-mid text-white hover:bg-ogbenjuwa-green-mid/90">
                  {credLoading ? 'Signing in...' : 'Sign in'} <ChevronRight className="h-4 w-4" />
                </Button>
              </form>
            )}

            {step === 'phone' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink pl-9 font-mono text-white"
                      placeholder="+234 803 441 2290"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handlePhoneSubmit(); }}
                    />
                  </div>
                  {phoneError && (
                    <p className="flex items-center gap-1 text-xs text-ogbenjuwa-red">
                      <AlertCircle className="h-3 w-3" /> {phoneError}
                    </p>
                  )}
                </div>

                <Button className="w-full gap-2 bg-ogbenjuwa-green-mid text-white hover:bg-ogbenjuwa-green-mid/90" onClick={handlePhoneSubmit}>
                  Send OTP <ChevronRight className="h-4 w-4" />
                </Button>

                <div className="rounded-lg border border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-green-light/5 p-3">
                  <p className="mb-1 text-xs font-semibold text-ogbenjuwa-green-mid">How to login</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    Enter your registered phone number to receive an OTP code. If you haven't registered, contact your LGA coordinator.
                  </p>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={(val) => {
                      setOtpValue(val);
                      if (val.length === 6 && !submitting) {
                        handleOTPComplete(val);
                      }
                    }}
                    disabled={!!(lockedUntil && Date.now() < lockedUntil) || submitting}
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink text-white h-12 w-10 text-lg" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && !lockedUntil && (
                  <p className="flex items-center justify-center gap-1 text-xs text-ogbenjuwa-red">
                    <AlertCircle className="h-3 w-3" /> {error}
                  </p>
                )}

                {lockedUntil && Date.now() < lockedUntil ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-ogbenjuwa-red">
                    <Clock className="h-4 w-4" />
                    Locked: {formatLockout()}
                  </div>
                ) : submitting ? (
                  <p className="text-center text-xs text-muted-foreground">Verifying...</p>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Attempt {attempts + 1} of 3
                  </p>
                )}

                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => { setStep(authMethod); setOtpValue(''); setError(''); }}
                  disabled={submitting}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {(brand?.siteName || 'Ogbenjuwa')} v0.1.0 &mdash; Idoma Region, Benue State, Nigeria
        </p>
      </div>
    </div>
  );
}
