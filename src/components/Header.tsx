'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/I18nProvider';
import { Mascot } from '@/components/Mascot';
import { ThemeToggle } from '@/components/ThemeToggle';

const LINKS = [
  { href: '/', key: 'nav_translate' },
  { href: '/practice', key: 'nav_practice' },
  { href: '/how-it-works', key: 'nav_how' },
] as const;

export function Header() {
  const { t, lang, setLang } = useI18n();
  const pathname = usePathname().replace(/\/$/, '') || '/';
  return (
    <header className="header">
      <Link href="/" className="brand rounded-2xl">
        <Mascot />
        <div>
          <h1 className="title">
            ภาษาลู <span className="title-accent">Translator</span>
          </h1>
          <p className="tagline">{t('tagline')}</p>
        </div>
      </Link>
      <div className="header-r">
        <nav className="tabs" aria-label={t('nav_label')}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="tab" aria-current={pathname === l.href ? 'page' : undefined}>
              {t(l.key)}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="icon-lg"
          className="w-auto gap-1 px-3 text-sm"
          aria-label={t('lang_toggle')}
          onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
        >
          <Languages aria-hidden /> {t('lang_short')}
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return <footer className="footer">{t('footer')}</footer>;
}
