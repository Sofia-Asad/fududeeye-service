import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

import Button from '@/components/ui/Button'

export interface ErrorStateProps {
  title?: string
  description?: string
  action?: ReactNode
  onRetry?: () => void
}

export default function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  action,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="grid justify-items-center gap-3 rounded-lg border border-danger-soft bg-danger-soft/40 px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle size={20} />
      </div>
      <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink-muted">{description}</p>
      {action}
      {onRetry && !action && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
