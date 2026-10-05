import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-[60px] w-full rounded-[18px] border-2 border-border bg-field px-[18px] font-body text-[22px] text-ink placeholder:text-placeholder',
        className,
      )}
      {...props}
    />
  );
}
