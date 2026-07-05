import { type ReactNode } from 'react'
import { X } from 'lucide-react'

import { useEscapeToClose } from '@/hooks/useEscapeToClose'
import { cn } from '@/lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}

export default function Modal({ isOpen, onClose, title, description, children, className }: ModalProps) {
  useEscapeToClose(isOpen, onClose)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        onClick={event => event.stopPropagation()}
        className={cn('w-full max-w-lg rounded-lg bg-surface shadow-lg', className)}
      >
        {(title ?? description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border p-6">
            <div>
              {title && (
                <h2 id="modal-title" className="font-serif text-xl font-semibold text-ink">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-ink-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border-strong text-ink-muted hover:bg-primary-soft"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
