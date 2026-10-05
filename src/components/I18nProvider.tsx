'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DICT, format, type Key, type Lang } from '@/lib/i18n';
import { storage } from '@/lib/utils';

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<Ctx | null>(null);
const LANG_KEY = 'pasaloo:lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('th'); // same on server + first client render, then restored below

  useEffect(() => {
    const saved = storage.get<Lang | null>(LANG_KEY, null);
    if (saved === 'th' || saved === 'en') setLangState(saved);
    else if (!navigator.language.toLowerCase().startsWith('th')) setLangState('en'); // first visit: follow the browser
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.set(LANG_KEY, l);
  }, []);
  const t = useCallback<Ctx['t']>((key, vars) => format(DICT[lang][key], vars), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
