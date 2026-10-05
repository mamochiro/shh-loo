'use client';
import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { motion } from 'motion/react';

export function SwapButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [turns, setTurns] = useState(0);
  return (
    <button
      type="button"
      className="swap max-[860px]:rotate-90"
      aria-label={label}
      title={label}
      onClick={() => {
        setTurns((n) => n + 1);
        onClick();
      }}
    >
      <motion.span className="flex" animate={{ rotate: turns * 180 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
        <ArrowLeftRight size={26} strokeWidth={2.4} aria-hidden />
      </motion.span>
    </button>
  );
}
