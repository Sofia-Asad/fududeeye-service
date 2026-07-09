import { Eye, Target } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import Container from '@/layout/Container'
import Section from '@/layout/Section'
import { cn } from '@/lib/utils'

const PANELS = [
  {
    icon: Target,
    tone: 'bg-primary-soft text-primary',
    border: 'border-t-primary',
    eyebrow: 'Our Mission',
    heading: 'Connecting People Through Trusted Brokerage',
    body: 'Our mission is to provide a secure, transparent, and professional marketplace where individuals and businesses can confidently buy and sell quality products. We strive to simplify every transaction while delivering exceptional customer service and building long-term trust within our community.',
  },
  {
    icon: Eye,
    tone: 'bg-gold-soft text-gold-hover',
    border: 'border-t-gold',
    eyebrow: 'Our Vision',
    heading: "To Become Somalia's Most Trusted Digital Marketplace",
    body: "Our vision is to become Somalia's leading brokerage and marketplace platform by empowering communities through technology, trusted relationships, and innovative digital solutions that make buying and selling simple, safe, and accessible for everyone.",
  },
] as const

export default function MissionVisionSection() {
  return (
    <Section className="py-8">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          {PANELS.map(panel => (
            <Card key={panel.eyebrow} className={cn('border-t-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md', panel.border)}>
              <CardContent className="p-8">
                <span className={cn('grid h-12 w-12 place-items-center rounded-md', panel.tone)}>
                  <panel.icon size={22} aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gold-hover">{panel.eyebrow}</p>
                <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{panel.heading}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{panel.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
