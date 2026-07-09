import FeatureCard from '@/components/ui/FeatureCard'
import SectionHeading from '@/components/ui/SectionHeading'
import { WHY_CHOOSE_ABOUT } from '@/components/about/aboutContent'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

export default function WhyChooseAboutSection() {
  return (
    <Section className="py-8">
      <Container>
        <SectionHeading title="Why Customers Choose Fududeeye" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_ABOUT.map(feature => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              tone={feature.tone}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
