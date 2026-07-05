import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const describedBy = error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined

    return (
      <div className="grid gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            'w-full resize-y rounded-md border border-border-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors',
            'focus-visible:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/30',
            error && 'border-danger focus-visible:outline-danger/30',
            className,
          )}
          {...props}
        />
        {error && (
          <span id={`${textareaId}-error`} className="text-xs font-medium text-danger">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${textareaId}-helper`} className="text-xs text-ink-muted">
            {helperText}
          </span>
        )}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

export default Textarea
