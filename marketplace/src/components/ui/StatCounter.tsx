import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/utils'

export interface StatCounterProps {
  value: number
  suffix?: string
  label: string
  tone?: 'default' | 'inverted'
}

/** Displays an animated count-up number with a label. */
export default function StatCounter({ value, suffix = '', label, tone = 'default' }: StatCounterProps) {
  const { ref, value: current } = useCountUp(value)

  return (
    <div className="text-center">
      <span
        ref={ref}
        className={cn(
          'block font-serif text-4xl font-semibold sm:text-5xl',
          tone === 'inverted' ? 'text-white' : 'text-primary',
        )}
      >
        {current.toLocaleString()}
        {suffix}
      </span>
      <span
        className={cn(
          'mt-2 block text-sm font-medium uppercase tracking-wide',
          tone === 'inverted' ? 'text-white/70' : 'text-ink-muted',
        )}
      >
        {label}
      </span>
    </div>
  )
}
