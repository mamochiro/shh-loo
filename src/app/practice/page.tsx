import type { Metadata } from 'next';
import { PracticeCard } from '@/components/PracticeCard';

export const metadata: Metadata = { title: 'โหมดฝึก · ภาษาลู Translator' };

export default function Page() {
  return <PracticeCard />;
}
