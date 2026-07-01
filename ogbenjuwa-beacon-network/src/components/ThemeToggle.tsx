import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <div className="h-5 w-5" />
      </Button>
    );
  }

  const current = theme === 'dark' ? 'dark' : 'light';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(current === 'dark' ? 'light' : 'dark')}
      title={`Switch to ${current === 'dark' ? 'light' : 'dark'} mode`}
    >
      {current === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
