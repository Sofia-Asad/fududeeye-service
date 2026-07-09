import { ArrowRight, Handshake, MessageCircle, PackageSearch, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import Container from '@/layout/Container'
import { cn } from '@/lib/utils'

/** Floating "brokerage" mockup — a self-contained illustration built from existing UI primitives, no external image asset required. */
function BrokerageIllustration() {
  return (
    <div className="relative mx-auto hidden max-w-sm lg:block">
      <span
        aria-hidden="true"
        className="absolute -right-6 -top-10 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-lg animate-fade-in"
        style={{ animationDelay: '150ms' }}
      >
        <ShieldCheck size={14} className="text-success" />
        Every listing verified
      </span>
      <span
        aria-hidden="true"
        className="absolute -bottom-6 -left-8 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-lg animate-fade-in"
        style={{ animationDelay: '300ms' }}
      >
        <PackageSearch size={14} className="text-gold-hover" />
        We source it for you
      </span>

      <div className="relative rotate-2 rounded-xl bg-white p-5 shadow-lg transition-transform duration-300 hover:rotate-0">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white">
            <Handshake size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Full-Service Brokerage</p>
            <p className="text-xs text-ink-muted">Intake to sale, handled for you</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2.5">
          <div className="flex items-center gap-2.5 text-sm text-ink-muted">
            <ShieldCheck size={15} className="shrink-0 text-success" />
            Item reviewed &amp; listed
          </div>
          <div className="flex items-center gap-2.5 text-sm text-ink-muted">
            <MessageCircle size={15} className="shrink-0 text-info" />
            Buyer conversations managed
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-gold-soft px-3.5 py-2.5">
          <span className="text-xs font-semibold text-gold-hover">You get your asking price</span>
          <ShieldCheck size={15} className="text-gold-hover" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

export default function ServicesHero() {
  return (
    <section className="relative min-h-[380px] overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-deep py-16 sm:min-h-[420px] sm:py-20">
      <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute right-1/3 top-10 h-24 w-24 rotate-45 rounded-2xl border border-white/10" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/4 bottom-8 h-16 w-16 rounded-full border border-gold/20" />

      <Container className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold ring-1 ring-inset ring-white/15">
            What we offer
          </span>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
            A Brokerage That <span className="text-gold">Does the Work for You</span>
          </h1>
          <p className="mt-5 text-lg text-white/70">
            Fududeeye isn&rsquo;t just a listings board — we manage the entire buying and selling journey,
            from intake and verification to the final handshake.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/listings" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              Browse Listings
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/contact"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-white/30 bg-transparent text-white hover:bg-white/10',
              )}
            >
              <MessageCircle size={17} />
              Contact Our Team
            </Link>
          </div>
        </div>

        <BrokerageIllustration />
      </Container>
    </section>
  )
}
