import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

/** Reusable section heading with an optional gold eyebrow label and subtitle. */
export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-hover">{eyebrow}</span>
      )}
      <h2 className="max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="max-w-2xl text-ink-muted">{subtitle}</p>}
    </div>
  )
}
