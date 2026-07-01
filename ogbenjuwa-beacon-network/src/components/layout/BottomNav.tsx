import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Rss, AlertTriangle, Phone, User, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import type { PageId } from '@/lib/types';

interface NavItem {
  icon: React.ElementType;
  labelKey: string;
  href: string;
  pageId: PageId;
}

const ALL_BOTTOM_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'nav.home', href: '/home', pageId: 'dashboard' },
  { icon: Siren, labelKey: 'nav.alert', href: '/alert', pageId: 'alert' },
  { icon: Rss, labelKey: 'nav.feed', href: '/feed', pageId: 'feed' },
  { icon: AlertTriangle, labelKey: 'nav.report', href: '/report', pageId: 'report' },
  { icon: Phone, labelKey: 'nav.help', href: '/resources', pageId: 'resources' },
  { icon: User, labelKey: 'nav.profile', href: '/profile', pageId: 'profile' },
];

export function BottomNav() {
  const { checkAccess } = useAuth();
  const { lang } = useLanguage();

  const visibleItems = ALL_BOTTOM_ITEMS.filter(
    (item) => checkAccess(item.pageId)
  );

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t bg-background px-2 pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-md p-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{t(item.labelKey, lang)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
