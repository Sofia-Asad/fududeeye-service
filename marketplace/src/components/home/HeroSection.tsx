import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import HeroSearch from '@/components/home/HeroSearch'
import { HERO_IMAGE_URL } from '@/features/listings/placeholderData'
import Container from '@/layout/Container'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

const HERO_WHATSAPP_MESSAGE = "Hi Fududeeye, I'd like to know more about your listings."

export default function HeroSection() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-primary-soft/60 to-bg">
      <Container className="py-14 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-hover">
              <ShieldCheck size={14} aria-hidden="true" />
              Trusted brokerage marketplace
            </span>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-[3.25rem]">
              Buy and sell quality <span className="text-primary">second-hand goods</span> with confidence.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-muted">
              Fududeeye connects buyers and sellers of electronics, vehicles, furniture, and more — every listing
              verified by our brokerage team.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/listings" className={buttonVariants({ size: 'lg' })}>
                Browse Listings
                <ArrowRight size={18} />
              </Link>
              <a
                href={buildWhatsAppUrl(HERO_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                <MessageCircle size={17} />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
              <img
                src={HERO_IMAGE_URL}
                alt="Buyers and sellers browsing quality goods on the Fududeeye marketplace"
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-lg border border-border bg-surface px-5 py-4 shadow-md sm:block">
              <p className="font-serif text-2xl font-semibold text-primary">1,200+</p>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Active listings</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <HeroSearch />
        </div>
      </Container>
    </section>
  )
}
