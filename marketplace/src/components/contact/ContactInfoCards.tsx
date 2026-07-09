import { Clock, Mail, MapPin, MessageCircle, Phone, Zap } from 'lucide-react'
import type { ReactNode } from 'react'

import { buttonVariants } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { CONTACT_INFO } from '@/constants/nav'
import { ICON_TONE_CLASSES, type IconTone } from '@/lib/toneStyles'
import { cn } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

const CONTACT_WHATSAPP_MESSAGE = "Hi Fududeeye, I'd like to get in touch."

const CARDS: { icon: typeof Phone; tone: IconTone; title: string; value: ReactNode }[] = [
  {
    icon: Phone,
    tone: 'success',
    title: 'Phone Numbers',
    value: (
      <div className="grid gap-0.5">
        {CONTACT_INFO.phones.map(phone => (
          <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary">
            {phone}
          </a>
        ))}
      </div>
    ),
  },
  {
    icon: Mail,
    tone: 'info',
    title: 'Email Address',
    value: (
      <div className="grid gap-0.5">
        <a href={`mailto:${CONTACT_INFO.supportEmail}`} className="hover:text-primary">{CONTACT_INFO.supportEmail}</a>
        <a href={`mailto:${CONTACT_INFO.generalEmail}`} className="hover:text-primary">{CONTACT_INFO.generalEmail}</a>
      </div>
    ),
  },
  {
    icon: MapPin,
    tone: 'gold',
    title: 'Office Location',
    value: <p>{CONTACT_INFO.addressLines.join(', ')}</p>,
  },
  {
    icon: Clock,
    tone: 'primary',
    title: 'Working Hours',
    value: (
      <div className="grid gap-0.5">
        {CONTACT_INFO.workingHours.map(row => (
          <p key={row.days}>
            <span className="font-semibold text-ink">{row.days}:</span> {row.hours}
          </p>
        ))}
      </div>
    ),
  },
  {
    icon: Zap,
    tone: 'success',
    title: 'Average Response',
    value: <p>{CONTACT_INFO.averageResponse}</p>,
  },
]

export default function ContactInfoCards() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map(card => (
          <Card
            key={card.title}
            className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <CardContent className="flex items-start gap-3.5">
              <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-md', ICON_TONE_CLASSES[card.tone])}>
                <card.icon size={19} aria-hidden="true" />
              </span>
              <div className="min-w-0 text-sm text-ink-muted">
                <p className="font-semibold text-ink">{card.title}</p>
                <div className="mt-0.5">{card.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <a
        href={buildWhatsAppUrl(CONTACT_WHATSAPP_MESSAGE)}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
      >
        <MessageCircle size={18} />
        Chat on WhatsApp
      </a>
    </div>
  )
}
