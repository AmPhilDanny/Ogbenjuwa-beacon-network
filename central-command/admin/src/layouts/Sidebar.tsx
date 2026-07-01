import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import {
  LayoutDashboard, Users, MapPin, AlertTriangle, ShieldAlert,
  Siren, MessageSquare, BarChart3, ScrollText, Key, Settings, Smartphone, X, Shield, type LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/users', icon: Users, roles: ['super_admin', 'state_observer', 'lga_coordinator'] },
  { label: 'LGAs', href: '/lgas', icon: MapPin, roles: ['super_admin', 'state_observer', 'lga_coordinator'] },
  { label: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { label: 'Incidents', href: '/incidents', icon: ShieldAlert },
  { label: 'Patrols', href: '/patrols', icon: Siren, roles: ['super_admin', 'lga_coordinator', 'vigilante_leader'] },
  { label: 'Communications', href: '/communications', icon: MessageSquare },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['super_admin', 'state_observer'] },
  { label: 'Audit Log', href: '/audit-logs', icon: ScrollText, roles: ['super_admin', 'state_observer'] },
  { label: 'API Keys', href: '/api-keys', icon: Key, roles: ['super_admin'] },
  { label: 'SMS Simulator', href: '/sms', icon: Smartphone, roles: ['super_admin', 'lga_coordinator'] },
  { label: 'Notifications', href: '/notifications', icon: Bell, roles: ['super_admin'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['super_admin'] },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuth();
  const [brand, setBrand] = useState<{ siteName?: string; logoUrl?: string | null }>({});

  useEffect(() => {
    api.get<{ siteName: string; logoUrl: string | null; tagline: string }>('/settings', { skipAuth: true })
      .then(setBrand)
      .catch(() => {});
  }, []);

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role ? item.roles.includes(user.role) : false;
  });

  return (
    <aside className="h-full bg-sidebar flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-muted">
        <div className="flex items-center gap-2">
          {brand?.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.siteName} className="h-8 w-8 rounded object-contain" />
          ) : null}
          <div>
            <h2 className="text-lg font-serif text-primary">{brand?.siteName || 'Ogbenjuwa'}</h2>
            <p className="text-[10px] text-sidebar-foreground/40 tracking-wider uppercase">Central Command</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-md hover:bg-sidebar-muted transition-colors"
        >
          <X className="w-4 h-4 text-sidebar-foreground/60" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
              isActive
                ? 'bg-sidebar-accent text-primary-foreground font-medium'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground',
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-muted">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-medium text-primary-foreground">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-sidebar-foreground/40 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
