'use client';
import { useRouter } from 'next/navigation';
import { HowItWorks } from '@/components/HowItWorks';

export default function Page() {
  const router = useRouter();
  return <HowItWorks onTry={(w) => router.push(`/?${new URLSearchParams({ t: w, d: 'th2loo' })}`)} />;
}
