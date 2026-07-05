import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface SpinnerProps {
  size?: number
  className?: string
  label?: string
}

export default function Spinner({ size = 20, className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center">
      <Loader2 size={size} className={cn('animate-spin text-primary', className)} />
    </span>
  )
}
