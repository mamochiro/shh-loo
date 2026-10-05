import * as React from 'react';
import { cn } from '@/lib/utils';

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-[132px] w-full flex-1 resize-y rounded-2xl border-none bg-field p-3 font-body text-xl leading-[1.6] text-ink placeholder:text-placeholder sm:min-h-44 sm:text-2xl',
        className,
      )}
      {...props}
    />
  );
}
