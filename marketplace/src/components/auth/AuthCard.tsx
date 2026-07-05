import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/** White rounded card used by the centered auth pages (forgot/reset password, verification, success). */
export default function AuthCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'w-full max-w-md rounded-lg border border-border bg-surface p-8 shadow-lg sm:p-10',
        className,
      )}
      {...props}
    />
  )
}
