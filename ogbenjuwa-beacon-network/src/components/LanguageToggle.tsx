import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLang}
      title={`Switch to ${lang === 'en' ? 'Idoma' : 'English'}`}
      className="gap-1.5 px-2"
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-semibold uppercase">{lang === 'en' ? 'EN' : 'ID'}</span>
    </Button>
  );
}
