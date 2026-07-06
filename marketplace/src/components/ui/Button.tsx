import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-b from-primary to-primary-hover text-white shadow-md hover:shadow-lg hover:-translate-y-px focus-visible:outline-gold',
        secondary: 'bg-gold text-ink shadow-sm hover:bg-gold-hover hover:-translate-y-px focus-visible:outline-primary/40',
        outline: 'border border-border-strong bg-surface text-ink hover:bg-primary-soft hover:-translate-y-px focus-visible:outline-primary/40',
        ghost: 'text-ink hover:bg-primary-soft focus-visible:outline-primary/40',
        danger: 'bg-danger text-white shadow-sm hover:bg-danger/90 hover:-translate-y-px focus-visible:outline-danger/40',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export default Button
