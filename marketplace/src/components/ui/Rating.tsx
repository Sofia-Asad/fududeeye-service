import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface RatingProps {
  value: number
  max?: number
  size?: number
  className?: string
}

/** Read-only star rating display. */
export default function Rating({ value, max = 5, size = 16, className }: RatingProps) {
  const rounded = Math.round(value)

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`Rated ${value} out of ${max}`}>
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          size={size}
          aria-hidden="true"
          className={index < rounded ? 'fill-gold text-gold' : 'fill-border text-border'}
        />
      ))}
    </div>
  )
}
