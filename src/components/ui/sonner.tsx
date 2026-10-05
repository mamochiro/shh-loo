'use client';
import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';

export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--ink)',
          color: 'var(--bg)',
          border: 'none',
          borderRadius: '999px',
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
        },
      }}
    />
  );
}
