import { Bell, Menu, User, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, logout } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getSiteSettings } from '@/lib/site-settings';

interface TopNavProps {
  onMenuClick?: () => void;
  onSOSClick: () => void;
}

export function TopNav({ onMenuClick, onSOSClick }: TopNavProps) {
  const { session, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const brand = getSiteSettings();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          {brand?.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.siteName} className="h-8 w-8 rounded-lg object-contain" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
          )}
          <span className="text-xl font-bold tracking-tight text-primary">
            {(brand?.siteName || 'OGBENJUWA').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-4">
        <Button 
          variant="destructive" 
          size="sm" 
          className="animate-pulse font-bold shadow-lg shadow-destructive/20 md:px-6"
          onClick={onSOSClick}
        >
          SOS
        </Button>
        
        {/* Theme toggle */}
        <ThemeToggle />
        
        {/* Authenticated user info */}
        {isAuthenticated && session && (
          <>
            <div className="hidden items-center gap-2 md:flex">
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs border-none">
                {session.lga}
              </Badge>
              <span className="text-sm text-muted-foreground">{session.name}</span>
            </div>

            <div className="h-6 w-px bg-border mx-1" />
          </>
        )}
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {isAuthenticated && session ? (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium">{session.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{session.phone}</p>
                    <p className="text-xs text-muted-foreground capitalize">{session.role.replace(/_/g, ' ')} · {session.lga}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/user-dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> My Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => navigate('/login')}>
                <User className="mr-2 h-4 w-4" /> Sign In
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
