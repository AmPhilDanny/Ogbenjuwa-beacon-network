import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Rss, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Phone, 
  Settings,
  Info,
  Siren,
  Radar,
  HeartHandshake,
  UserSquare,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import { getSiteSettings } from '@/lib/site-settings';
import type { PageId } from '@/lib/types';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  href: string;
  pageId: PageId;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { icon: UserSquare, labelKey: 'nav.user_dashboard', href: '/user-dashboard', pageId: 'user-dashboard' },
  { icon: LayoutDashboard, labelKey: 'nav.dashboard', href: '/home', pageId: 'dashboard' },
  { icon: Siren, labelKey: 'nav.alert', href: '/alert', pageId: 'alert' },
  { icon: Radar, labelKey: 'nav.patrol', href: '/patrol', pageId: 'patrol' },
  { icon: HeartHandshake, labelKey: 'nav.reunify', href: '/reunify', pageId: 'reunify' },
  { icon: Rss, labelKey: 'nav.feed', href: '/feed', pageId: 'feed' },
  { icon: AlertTriangle, labelKey: 'nav.report', href: '/report', pageId: 'report' },
  { icon: Users, labelKey: 'nav.neighborhood', href: '/neighborhood', pageId: 'neighborhood' },
  { icon: Phone, labelKey: 'nav.resources', href: '/resources', pageId: 'resources' },
];

const secondaryItems = [
  { icon: Settings, labelKey: 'nav.settings', href: '/profile' },
  { icon: Info, labelKey: 'nav.about', href: '/about' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { checkAccess } = useAuth();
  const { lang } = useLanguage();
  const brand = getSiteSettings();

  const visibleNavItems = ALL_NAV_ITEMS.filter(
    (item) => checkAccess(item.pageId)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-sidebar transition-transform duration-300 ease-in-out md:sticky md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6 md:hidden">
          {brand?.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.siteName} className="h-7 w-7 rounded object-contain" />
          ) : (
            <Shield className="h-5 w-5 text-sidebar-foreground" />
          )}
          <span className="text-xl font-bold text-sidebar-foreground">{(brand?.siteName || 'OGBENJUWA').toUpperCase()}</span>
        </div>

        <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
          <nav className="space-y-1">
            <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Operations
            </p>
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey, lang)}
              </NavLink>
            ))}
          </nav>

          <nav className="space-y-1 border-t pt-4">
            {secondaryItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey, lang)}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
