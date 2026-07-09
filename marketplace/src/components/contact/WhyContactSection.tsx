import { Clock, ShieldCheck, Users, Zap } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import SectionHeading from '@/components/ui/SectionHeading'
import { ICON_TONE_CLASSES, type IconTone } from '@/lib/toneStyles'
import { cn } from '@/lib/utils'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const REASONS: { icon: typeof Zap; tone: IconTone; title: string; description: string }[] = [
  {
    icon: Zap,
    tone: 'gold',
    title: 'Fast Response',
    description: 'We answer quickly during business hours.',
  },
  {
    icon: ShieldCheck,
    tone: 'success',
    title: 'Trusted Marketplace',
    description: 'Verified buyers and sellers.',
  },
  {
    icon: Users,
    tone: 'info',
    title: 'Professional Team',
    description: 'Friendly support from experienced staff.',
  },
  {
    icon: Clock,
    tone: 'primary',
    title: 'Safe Transactions',
    description: 'Helping customers buy and sell with confidence.',
  },
]

export default function WhyContactSection() {
  return (
    <Section className="py-8">
      <Container>
        <SectionHeading title="Why Customers Choose Fududeeye" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(reason => (
            <Card key={reason.title} className="text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-3">
                <span className={cn('grid h-12 w-12 place-items-center rounded-full', ICON_TONE_CLASSES[reason.tone])}>
                  <reason.icon size={21} aria-hidden="true" />
                </span>
                <h3 className="font-serif text-base font-semibold text-ink">{reason.title}</h3>
                <p className="text-sm text-ink-muted">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
