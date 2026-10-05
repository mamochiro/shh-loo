import { Suspense } from 'react';
import { TranslatorPanel } from '@/components/TranslatorPanel';

export default function Page() {
  // useSearchParams (?t=&d= share links) needs a Suspense boundary in a static export
  return (
    <Suspense fallback={<div className="min-h-[640px]" aria-busy="true" />}>
      <TranslatorPanel />
    </Suspense>
  );
}
