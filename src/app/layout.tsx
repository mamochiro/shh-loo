import type { Metadata, Viewport } from 'next';
import { Noto_Sans_Thai, Prompt } from 'next/font/google';
import { Header, SiteFooter } from '@/components/Header';
import { Providers } from '@/components/Providers';
import './globals.css';

const prompt = Prompt({ subsets: ['thai', 'latin'], weight: ['500', '600', '700'], variable: '--font-prompt', display: 'swap' });
const noto = Noto_Sans_Thai({ subsets: ['thai', 'latin'], weight: ['400', '500', '600'], variable: '--font-noto', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'),
  title: 'ภาษาลู Translator',
  description: 'แปลภาษาไทยเป็นภาษาลู และแปลกลับ แบบสด ๆ ขณะพิมพ์ — Thai ⇄ Pasa Loo, live as you type.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFF7F1' },
    { media: '(prefers-color-scheme: dark)', color: '#16131E' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${prompt.variable} ${noto.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <div className="wrap">
            <Header />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
