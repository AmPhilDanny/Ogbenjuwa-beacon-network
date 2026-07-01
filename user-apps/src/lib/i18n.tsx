// ─── Ogbenjuwa Citizen Portal — i18n Context Provider ─────────────────
// Wraps the app with language state, persisted in profile (localStorage).
// Every component uses `useLanguage().t(key)` for all visible text.

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { t as translate, type Language } from './translations';
import { PROFILE_STORAGE_KEY } from './data';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function loadLanguageFromProfile(): Language {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const profile = JSON.parse(raw);
      if (profile?.preferences?.language === 'idoma') return 'idoma';
    }
  } catch { /* ignore */ }
  return 'en';
}

function persistLanguage(lang: Language): void {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const profile = JSON.parse(raw);
      profile.preferences = { ...profile.preferences, language: lang };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }
  } catch { /* ignore */ }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(loadLanguageFromProfile);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    persistLanguage(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => {
      const next = prev === 'en' ? 'idoma' : 'en';
      persistLanguage(next);
      return next;
    });
  }, []);

  const t = useCallback((key: string): string => {
    return translate(key, language);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t, toggleLanguage }), [language, setLanguage, t, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
