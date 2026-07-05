import { Handshake, MapPin, ShieldCheck, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import PageTitle from '@/components/ui/PageTitle'
import SectionHeading from '@/components/ui/SectionHeading'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const VALUES = [
  {
    icon: Handshake,
    title: 'Fair, transparent brokerage',
    description: 'We connect buyers with quality second-hand goods while making sure sellers get the price they asked for.',
  },
  {
    icon: ShieldCheck,
    title: 'Every listing reviewed',
    description: 'Our team checks each item before it goes live, so what you see on the marketplace is accurate and current.',
  },
  {
    icon: Users,
    title: 'People, not just listings',
    description: 'A real team answers your messages on WhatsApp — no bots, no waiting in a queue.',
  },
  {
    icon: MapPin,
    title: 'Rooted in Somalia',
    description: 'Built for buyers and sellers across Mogadishu, Hargeisa, Bosaso, and beyond.',
  },
]

export default function About() {
  return (
    <Container className="py-10">
      <PageTitle
        eyebrow="About us"
        title="A trusted brokerage marketplace, built for Somalia"
        subtitle="Fududeeye connects buyers and sellers of quality second-hand goods — electronics, furniture, vehicles, and more — with a real team standing behind every listing."
      />

      <Section className="py-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="grid gap-4 text-ink-muted">
            <p>
              Fududeeye started as a simple idea: buying and selling second-hand goods shouldn&rsquo;t mean
              endless scrolling through unverified posts and unanswered messages. We wanted a marketplace
              where every listing has been looked at by a real person, and every question gets a real answer.
            </p>
            <p>
              Today, our team manages the full catalog — adding new items, checking condition and pricing,
              and following up on every inquiry that comes in through the site or WhatsApp. When you reach out
              about an item or tell us what you&rsquo;re looking for, you&rsquo;re talking to the people who
              actually run the marketplace, not an automated system.
            </p>
            <p>
              Whether you&rsquo;re after a good deal on electronics, furniture, or a vehicle — or you have
              something to sell and want a broker to help find the right buyer — Fududeeye is built to make
              that process straightforward and trustworthy.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map(value => (
              <Card key={value.title}>
                <CardContent className="flex flex-col gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-primary-soft text-primary">
                    <value.icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="font-serif text-base font-semibold text-ink">{value.title}</h3>
                  <p className="text-sm text-ink-muted">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-8">
        <SectionHeading
          eyebrow="How we work"
          title="A brokerage, not just a listings board"
          subtitle="Every item on Fududeeye is handled by our team from intake to sale — here's what that means for you."
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-semibold text-ink">For buyers</p>
            <p className="mt-2 text-sm text-ink-muted">
              Browse a catalog that&rsquo;s actively maintained, with accurate pricing and condition — and reach
              a real person the moment you have a question.
            </p>
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-ink">For sellers</p>
            <p className="mt-2 text-sm text-ink-muted">
              Bring your item to our team and we&rsquo;ll list it, market it, and handle buyer inquiries on
              your behalf — you get your asking price when it sells.
            </p>
          </div>
          <div>
            <p className="font-serif text-lg font-semibold text-ink">For everyone</p>
            <p className="mt-2 text-sm text-ink-muted">
              Can&rsquo;t find what you need? Tell us and we&rsquo;ll reach out if we can source it for you.
            </p>
          </div>
        </div>
      </Section>
    </Container>
  )
}
