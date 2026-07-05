import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export default function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn('py-12 sm:py-16', className)} {...props} />
}
