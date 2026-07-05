import { Card, CardContent } from '@/components/ui/Card'
import SectionHeading from '@/components/ui/SectionHeading'
import { WHY_CHOOSE_FEATURES } from '@/components/home/homeContent'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

export default function WhyChooseSection() {
  return (
    <Section className="bg-primary-soft/30">
      <Container>
        <SectionHeading
          eyebrow="Why choose us"
          title="Built on trust and brokerage expertise"
          subtitle="Everything you need to buy and sell second-hand goods with total confidence."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_FEATURES.map(feature => (
            <Card key={feature.title} className="transition-shadow duration-200 hover:shadow-md">
              <CardContent className="flex flex-col gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-md bg-gold-soft text-gold-hover">
                  <feature.icon size={22} aria-hidden="true" />
                </span>
                <h3 className="font-serif text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="text-sm text-ink-muted">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
