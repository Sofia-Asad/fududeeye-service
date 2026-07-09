import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import { ICON_TONE_CLASSES, type IconTone } from '@/lib/toneStyles'
import { cn } from '@/lib/utils'

export interface FeatureCardProps {
  icon: LucideIcon
  tone?: IconTone
  title: string
  description: string
  align?: 'left' | 'center'
  className?: string
}

/** Icon + title + description card with a hover-lift — the repeated "feature" pattern used across the marketplace's informational pages. */
export default function FeatureCard({ icon: Icon, tone = 'primary', title, description, align = 'left', className }: FeatureCardProps) {
  return (
    <Card className={cn('transition-all duration-200 hover:-translate-y-1 hover:shadow-md', className)}>
      <CardContent className={cn('flex flex-col gap-3', align === 'center' && 'items-center text-center')}>
        <span className={cn('grid h-11 w-11 place-items-center rounded-md', ICON_TONE_CLASSES[tone])}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <h3 className="font-serif text-base font-semibold text-ink">{title}</h3>
        <p className="text-sm text-ink-muted">{description}</p>
      </CardContent>
    </Card>
  )
}
