'use client';
import { MotionConfig } from 'motion/react';
import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '@/components/I18nProvider';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
