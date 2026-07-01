import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Phone, ChevronRight, ChevronLeft, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { getSiteSettings } from '@/lib/site-settings';

const PHONE_REGEX = /^\+234[789][01]\d{8}$/;
type Step = 'phone' | 'otp';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login } = useAuth();
  const brand = getSiteSettings();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePhoneSubmit = useCallback(() => {
    const cleaned = phone.trim();
    if (!PHONE_REGEX.test(cleaned)) {
      setPhoneError(t('auth.phone_error') || 'Enter a valid Nigerian number: +234 803 XXX XXXX');
      return;
    }
    setPhoneError('');
    toast.success(t('auth.code_sent') || 'Code sent to ' + cleaned);
    setStep('otp');
  }, [phone, t]);

  const handleOtpComplete = useCallback(async (value: string) => {
    if (lockedUntil && Date.now() < lockedUntil) return;
    setSubmitting(true);
    try {
      await login(phone, value);
      toast.success(t('general.welcome') || 'Welcome!');
      navigate('/vigilante-dashboard', { replace: true });
    } catch {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setOtpValue('');
      if (newAttempts >= 3) {
        setLockedUntil(Date.now() + 15 * 60 * 1000);
        toast.error(t('auth.locked') || 'Too many attempts. Locked for 15 minutes.');
      } else {
        toast.error(`${t('auth.wrong_code') || 'Wrong code'}. ${t('auth.attempt') || 'Attempt'} ${newAttempts} ${t('general.of') || 'of'} 3.`);
      }
    } finally {
      setSubmitting(false);
    }
  }, [attempts, lockedUntil, phone, login, navigate, t]);

  const formatLockout = () => {
    if (!lockedUntil) return '';
    const remaining = Math.max(0, Math.floor((lockedUntil - Date.now()) / 1000));
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
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
          <p className="mt-1 text-sm text-muted-foreground">{brand?.tagline || (t('auth.subtitle') || 'Citizen Portal')}</p>
        </div>

        <Card className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink-mid/50">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {step === 'phone' ? (t('auth.login') || 'Welcome') : (t('auth.enter_otp') || 'Enter Code')}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {step === 'phone'
                ? (t('auth.phone_instruction') || 'Enter your Nigerian phone number')
                : `${t('auth.code_sent') || 'Code sent to'} ${phone}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'phone' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">{t('auth.phone_label') || 'Phone Number'}</Label>
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
                  {t('auth.send_otp') || 'Send Code'} <ChevronRight className="h-4 w-4" />
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
                    onChange={(val) => { setOtpValue(val); if (val.length === 6 && !submitting) handleOtpComplete(val); }}
                    disabled={!!(lockedUntil && Date.now() < lockedUntil) || submitting}
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} className="border-ogbenjuwa-green-mid/20 bg-ogbenjuwa-ink text-white h-12 w-10 text-lg" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {lockedUntil && Date.now() < lockedUntil ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-ogbenjuwa-red">
                    <Clock className="h-4 w-4" /> {t('auth.locked') || 'Locked'}: {formatLockout()}
                  </div>
                ) : submitting ? (
                  <p className="text-center text-xs text-muted-foreground">Verifying...</p>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">{t('auth.attempt') || 'Attempt'} {attempts + 1} {t('general.of') || 'of'} 3</p>
                )}
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { setStep('phone'); setOtpValue(''); }} disabled={submitting}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> {t('auth.otp_hint') || 'Back'}
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
