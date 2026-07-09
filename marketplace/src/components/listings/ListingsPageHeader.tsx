import type { ReactNode } from 'react'

import Container from '@/layout/Container'

export interface ListingsPageHeaderProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

/** Compact navy/gold banner for functional (non-marketing) pages — same premium language as the Contact/About/Services heroes, sized for a page users return to often. */
export default function ListingsPageHeader({ eyebrow, title, subtitle, actions }: ListingsPageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-deep py-10 sm:py-12">
      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

      <Container className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gold">{eyebrow}</p>
          )}
          <h1 className="font-serif text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-xl text-white/70">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </Container>
    </section>
  )
}
