import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import HeroSearch from '@/components/home/HeroSearch'
import { HERO_IMAGE_URL } from '@/features/listings/placeholderData'
import Container from '@/layout/Container'
import { cn } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

const HERO_WHATSAPP_MESSAGE = "Hi Fududeeye, I'd like to know more about your listings."

export default function HeroSection() {
  return (
    <section className="relative min-h-[560px] overflow-hidden">
      <img
        src={HERO_IMAGE_URL}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-deep/95 via-primary-deep/85 to-primary/60" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/5 blur-3xl"
      />

      <Container className="relative flex min-h-[560px] flex-col justify-center py-14 sm:py-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-inset ring-white/15">
            <ShieldCheck size={14} aria-hidden="true" />
            Trusted brokerage marketplace
          </span>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Buy and sell quality <span className="text-gold">second-hand goods</span> with confidence.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/70">
            Fududeeye connects buyers and sellers of electronics, vehicles, furniture, and more — every listing
            verified by our brokerage team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/listings" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              Browse Listings
              <ArrowRight size={18} />
            </Link>
            <a
              href={buildWhatsAppUrl(HERO_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noreferrer noopener"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'border-white/30 bg-transparent text-white hover:bg-white/10',
              )}
            >
              <MessageCircle size={17} />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-12 max-w-3xl">
          <HeroSearch />
        </div>
      </Container>
    </section>
  )
}
