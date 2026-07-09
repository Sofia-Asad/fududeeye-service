import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import Container from '@/layout/Container'
import Section from '@/layout/Section'
import { cn } from '@/lib/utils'

export default function ContactCta() {
  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary via-primary to-primary-deep px-6 py-14 text-center shadow-lg sm:px-12">
          <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
          <h2 className="relative mx-auto max-w-2xl font-serif text-3xl font-semibold text-white sm:text-4xl">
            Ready to Start Trading?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Join thousands of customers buying and selling through Fududeeye Marketplace.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/listings" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              Browse Listings
              <ArrowRight size={18} />
            </Link>
            <a
              href="#contact-form"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-white/30 bg-transparent text-white hover:bg-white/10',
              )}
            >
              Contact Our Team
            </a>
          </div>
        </div>
      </Container>
    </Section>
  )
}
