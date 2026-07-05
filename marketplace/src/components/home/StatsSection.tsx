import StatCounter from '@/components/ui/StatCounter'
import { MARKETPLACE_STATS } from '@/components/home/homeContent'
import Container from '@/layout/Container'

export default function StatsSection() {
  return (
    <section className="bg-primary-deep py-16">
      <Container>
        <h2 className="sr-only">Marketplace statistics</h2>
        <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {MARKETPLACE_STATS.map(stat => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              tone="inverted"
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
