import { ArrowRight, Headset, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import Container from '@/layout/Container'
import { cn } from '@/lib/utils'

/** Floating "support chat" mockup — a self-contained illustration built from existing UI primitives, no external image asset required. */
function SupportIllustration() {
  return (
    <div className="relative mx-auto hidden max-w-sm lg:block">
      <span
        aria-hidden="true"
        className="absolute -right-8 -top-10 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-lg animate-fade-in"
        style={{ animationDelay: '150ms' }}
      >
        <ShieldCheck size={14} className="text-success" />
        Verified Sellers
      </span>
      <span
        aria-hidden="true"
        className="absolute -bottom-6 -left-8 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink shadow-lg animate-fade-in"
        style={{ animationDelay: '300ms' }}
      >
        <Sparkles size={14} className="text-gold-hover" />
        500+ Happy Customers
      </span>

      <div className="relative rotate-2 rounded-xl bg-white p-5 shadow-lg transition-transform duration-300 hover:rotate-0">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-white">
            <Headset size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Fududeeye Support</p>
            <p className="flex items-center gap-1.5 text-xs text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Online now
            </p>
          </div>
        </div>

        <div className="grid gap-2.5 pt-4">
          <div className="max-w-[80%] rounded-xl rounded-tl-sm bg-bg px-3.5 py-2.5 text-sm text-ink-muted">
            Hi! Is this item still available?
          </div>
          <div className="ml-auto max-w-[80%] rounded-xl rounded-tr-sm bg-gradient-to-br from-primary to-primary-hover px-3.5 py-2.5 text-sm text-white">
            Yes it is! Happy to help you with it today.
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-gold-soft px-3.5 py-2.5">
          <span className="text-xs font-semibold text-gold-hover">Average response</span>
          <span className="text-xs font-bold text-ink">30 min</span>
        </div>
      </div>
    </div>
  )
}

export default function ContactHero() {
  return (
    <section className="relative min-h-[380px] overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-deep py-16 sm:min-h-[420px] sm:py-20">
      {/* Abstract geometric / floating shape accents */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute right-1/3 top-10 h-24 w-24 rotate-45 rounded-2xl border border-white/10" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/4 bottom-8 h-16 w-16 rounded-full border border-gold/20" />

      <Container className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold ring-1 ring-inset ring-white/15">
            Get in touch
          </span>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Let&rsquo;s Help You <span className="text-gold">Buy, Sell &amp; Grow</span>
          </h1>
          <p className="mt-5 text-lg text-white/70">
            Whether you&rsquo;re looking for the perfect item, selling something valuable, or simply have
            questions, our team is ready to help you.
          </p>
          <p className="mt-3 text-white/60">
            We believe every customer deserves fast, friendly, and professional support.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contact-form" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              Contact Our Team
              <ArrowRight size={18} />
            </a>
            <Link
              to="/listings"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-white/30 bg-transparent text-white hover:bg-white/10',
              )}
            >
              <MessageCircle size={17} />
              Browse Listings
            </Link>
          </div>
        </div>

        <SupportIllustration />
      </Container>
    </section>
  )
}
