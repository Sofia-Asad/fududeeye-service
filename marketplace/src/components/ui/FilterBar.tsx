import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface FilterBarProps {
  children: ReactNode
  className?: string
}

/** Horizontal, wrapping container for search boxes, selects, and filter buttons. */
export default function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm', className)}>
      {children}
    </div>
  )
}
