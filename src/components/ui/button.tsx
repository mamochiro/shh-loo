import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border-2 border-transparent font-display text-[15px] font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-ink hover:opacity-90',
        ghost: 'border-border bg-card hover:bg-soft',
        soft: 'bg-card hover:bg-soft',
        mint: 'bg-mint text-mint-ink hover:opacity-90',
        text: 'bg-transparent text-sub hover:bg-soft',
        flat: 'bg-transparent hover:bg-soft',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-11 px-4 text-sm',
        lg: 'h-12 px-5',
        icon: 'size-11 border-border bg-card p-0 hover:bg-soft [&_svg]:size-[22px]',
        'icon-lg': 'size-[52px] border-none bg-card p-0 shadow-card hover:bg-soft [&_svg]:size-[22px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
