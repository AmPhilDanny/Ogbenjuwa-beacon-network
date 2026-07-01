import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import PersonalInfo from './PersonalInfo';
import NotificationPrefs from './NotificationPrefs';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
  const { logout } = useAuth();
  const { profile, isDirty, updateField, updatePreferences, save } = useProfile();

  const handleSave = () => {
    save();
    toast.success(t('profile.saved'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('profile.title')}</h1>
          <p className="text-sm text-muted-foreground">{profile.lga} · {profile.phone}</p>
        </div>
        {isDirty && <Button onClick={handleSave}>{t('profile.save')}</Button>}
      </header>

      <PersonalInfo profile={profile} onUpdate={updateField} />
      <NotificationPrefs preferences={profile.preferences} onUpdate={updatePreferences} />

      {/* Language Toggle */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{t('profile.language')}</p>
            <p className="text-xs text-muted-foreground">{language === 'en' ? t('profile.lang_en') : t('profile.lang_idoma')}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-accent"
          onClick={toggleLanguage}
        >
          {language === 'en' ? 'Idoma' : 'English'}
        </Badge>
      </div>

      <Separator />

      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start gap-2 text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> {t('profile.logout')}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2 text-destructive border-destructive/30">
              <Trash2 className="h-4 w-4" /> {t('profile.delete_account')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('profile.delete_account')}</AlertDialogTitle>
              <AlertDialogDescription>{t('profile.delete_confirm') || 'This action cannot be undone. Type DELETE to confirm.'}</AlertDialogDescription>
            </AlertDialogHeader>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              placeholder={t('profile.delete_placeholder') || 'Type DELETE to confirm'}
              maxLength={6}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>{t('general.cancel') || 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground">{t('profile.delete_confirm_btn') || 'Delete'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
