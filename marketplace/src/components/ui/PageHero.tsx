import type { ReactNode } from 'react'

import Container from '@/layout/Container'

export interface PageHeroProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
}

/** Dark navy page-opener band with soft gold/white glow accents — used by the informational pages (Services, About, Contact, FAQ). */
export default function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-deep py-14 sm:py-16">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-16 h-60 w-60 rounded-full bg-white/5 blur-3xl"
      />
      <Container className="relative">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">{eyebrow}</p>
        )}
        <h1 className="max-w-2xl font-serif text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-white/70">{subtitle}</p>}
      </Container>
    </section>
  )
}
