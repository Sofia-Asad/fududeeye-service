import type { ReactNode } from 'react'

import Container from '@/layout/Container'
import Section from '@/layout/Section'

export interface CtaBannerProps {
  heading: ReactNode
  description: ReactNode
  children: ReactNode
}

/** Navy/gold gradient CTA banner with soft blur accents — shared visual chrome for the pre-footer call-to-action on informational pages. */
export default function CtaBanner({ heading, description, children }: CtaBannerProps) {
  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary via-primary to-primary-deep px-6 py-14 text-center shadow-lg sm:px-12">
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
          <h2 className="relative mx-auto max-w-2xl font-serif text-3xl font-semibold text-white sm:text-4xl">{heading}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/70">{description}</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">{children}</div>
        </div>
      </Container>
    </Section>
  )
}
