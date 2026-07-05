import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-ink/10', className)} {...props} />
}

export function SkeletonLines({ widths = ['60%', '80%', '40%'] }: { widths?: string[] }) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-surface p-6">
      {widths.map((width, index) => (
        <Skeleton key={index} className="h-3" style={{ width }} />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="grid gap-4 rounded-lg border border-border bg-surface p-4">
      <Skeleton className="h-40 w-full rounded-md" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
