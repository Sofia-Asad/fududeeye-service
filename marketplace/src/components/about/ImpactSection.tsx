import StatCounter from '@/components/ui/StatCounter'
import { IMPACT_STATS } from '@/components/about/aboutContent'
import Container from '@/layout/Container'

export default function ImpactSection() {
  return (
    <section className="bg-primary-deep py-16">
      <Container>
        <h2 className="text-center font-serif text-2xl font-semibold text-white sm:text-3xl">
          Our Growing Impact
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {IMPACT_STATS.map(stat => (
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
