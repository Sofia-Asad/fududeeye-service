import { ArrowRight, MessageCircle, PackageSearch, ShieldCheck, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/Button'
import PageTitle from '@/components/ui/PageTitle'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const SERVICES = [
  {
    icon: Tag,
    title: 'Consignment Selling',
    description:
      'Bring us your item and tell us your asking price. We list it, market it, and handle every buyer conversation — you get exactly the price you asked for when it sells.',
  },
  {
    icon: PackageSearch,
    title: 'Item Sourcing',
    description:
      'Looking for something specific that isn’t listed yet? Submit a request with what you need and your budget, and our team will reach out if we can find it.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    description:
      'Every item on the marketplace is reviewed by our team before it goes live — accurate photos, honest condition notes, and current pricing.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Buyer Support',
    description:
      'Questions about an item go straight to our team over WhatsApp or the contact form — a real person responds, not an automated reply.',
  },
]

const SERVICES_WHATSAPP_MESSAGE = "Hi Fududeeye, I'd like to ask about your services."

export default function Services() {
  return (
    <Container className="py-10">
      <PageTitle
        eyebrow="What we offer"
        title="Services"
        subtitle="Fududeeye is a brokerage — we don't just list items, we manage the process from intake to sale."
      />

      <Section className="py-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {SERVICES.map(service => (
            <Card key={service.title}>
              <CardContent className="flex flex-col gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-md bg-gold-soft text-gold-hover">
                  <service.icon size={20} aria-hidden="true" />
                </span>
                <h3 className="font-serif text-lg font-semibold text-ink">{service.title}</h3>
                <p className="text-sm text-ink-muted">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/listings" className={buttonVariants({ size: 'lg' })}>
            Browse Listings
            <ArrowRight size={18} />
          </Link>
          <a
            href={buildWhatsAppUrl(SERVICES_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
          >
            <MessageCircle size={17} />
            Ask About Selling
          </a>
        </div>
      </Section>
    </Container>
  )
}
