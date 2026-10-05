'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/I18nProvider';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  // both icons are rendered and swapped with the `dark:` variant, so SSR and client markup match
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label={t('theme_toggle')}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="hidden dark:block" aria-hidden />
      <Moon className="dark:hidden" aria-hidden />
    </Button>
  );
}
