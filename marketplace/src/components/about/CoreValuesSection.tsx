import FeatureCard from '@/components/ui/FeatureCard'
import SectionHeading from '@/components/ui/SectionHeading'
import { CORE_VALUES } from '@/components/about/aboutContent'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

export default function CoreValuesSection() {
  return (
    <Section className="py-8">
      <Container>
        <SectionHeading title="Our Core Values" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_VALUES.map(value => (
            <FeatureCard
              key={value.title}
              icon={value.icon}
              tone={value.tone}
              title={value.title}
              description={value.description}
              align="center"
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
