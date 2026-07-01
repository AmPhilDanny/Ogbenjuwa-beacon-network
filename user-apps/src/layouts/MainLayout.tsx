import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Users, MapPin, FileText, User, LogOut, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { destroySession } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { toast } from 'sonner';
import { getSiteSettings } from '@/lib/site-settings';

const NAV_ITEMS = [
  { icon: Shield, tKey: 'nav.vigilante', path: '/vigilante-dashboard' },
  { icon: Users, tKey: 'nav.community',  path: '/community-dashboard' },
  { icon: MapPin, tKey: 'nav.directory',  path: '/directory' },
  { icon: FileText, tKey: 'nav.report',   path: '/report' },
  { icon: User, tKey: 'nav.profile',     path: '/profile' },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const brand = getSiteSettings();

  const handleLogout = () => {
    destroySession();
    toast.success(t('nav.logout'));
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-3">
        <div className="flex items-center gap-2">
          {brand?.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.siteName} className="h-5 w-5 rounded object-contain" />
          ) : (
            <Shield className="h-5 w-5" style={{ color: brand?.primaryColor || '#059669' }} />
          )}
          <span className="font-semibold text-sm">{brand?.siteName || 'Ogbenjuwa'}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title={t('profile.language')}
          >
            <Globe className="h-3.5 w-3.5" />
            {language === 'en' ? 'ENG' : 'IDM'}
          </button>

          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Logout */}
          <Button variant="ghost" size="icon" onClick={handleLogout} title={t('nav.logout')}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card">
        <div className="flex items-center justify-around h-14">
          {NAV_ITEMS.map(item => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors ${
                  active ? 'text-ogbenjuwa-green' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {t(item.tKey)}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
