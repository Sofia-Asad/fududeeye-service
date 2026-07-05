import { ArrowRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const FINAL_CTA_WHATSAPP_MESSAGE = "Hi Fududeeye, I'd like to know more about your listings."

export default function FinalCtaSection() {
  return (
    <Section>
      <Container>
        <div className="overflow-hidden rounded-lg bg-primary px-6 py-14 text-center shadow-lg sm:px-12">
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-semibold text-white sm:text-4xl">
            Ready to Find Your Next Great Deal?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Browse verified listings or chat with us directly — no account needed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/listings" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              Browse Marketplace
              <ArrowRight size={18} />
            </Link>
            <a
              href={buildWhatsAppUrl(FINAL_CTA_WHATSAPP_MESSAGE)}
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
      </Container>
    </Section>
  )
}
