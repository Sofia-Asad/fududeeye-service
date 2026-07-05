import SectionHeading from '@/components/ui/SectionHeading'
import { HOW_IT_WORKS_STEPS } from '@/components/home/homeContent'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

export default function HowItWorksSection() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Simple process"
          title="How Fududeeye works"
          subtitle="From listing to sale in four straightforward steps."
        />

        <div className="relative mt-12">
          <div aria-hidden="true" className="absolute inset-x-[12%] top-8 hidden h-px bg-border lg:block" />
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map(step => (
              <li key={step.step} className="flex flex-col items-center text-center">
                <div className="relative">
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-border bg-surface text-primary shadow-sm">
                    <step.icon size={26} aria-hidden="true" />
                  </span>
                  <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-gold text-xs font-bold text-ink">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm text-ink-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  )
}
