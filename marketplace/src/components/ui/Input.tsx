import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  /** Optional slot rendered inside the field, e.g. a show/hide password toggle. */
  endAdornment?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, endAdornment, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const describedBy = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined

    return (
      <div className="grid gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn(
              'h-11 w-full rounded-md border border-border-strong bg-surface px-3.5 text-sm text-ink placeholder:text-ink-faint transition-colors',
              'focus-visible:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/30',
              error && 'border-danger focus-visible:outline-danger/30',
              endAdornment && 'pr-11',
              className,
            )}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{endAdornment}</div>
          )}
        </div>
        {error && (
          <span id={`${inputId}-error`} className="text-xs font-medium text-danger">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${inputId}-helper`} className="text-xs text-ink-muted">
            {helperText}
          </span>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export default Input
