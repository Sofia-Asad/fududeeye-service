import { Card, CardContent } from '@/components/ui/Card'
import SectionHeading from '@/components/ui/SectionHeading'
import { TEAM_MEMBERS } from '@/components/about/aboutContent'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

export default function TeamSection() {
  return (
    <Section className="py-8">
      <Container>
        <SectionHeading
          eyebrow="Our people"
          title="Meet Our Team"
          subtitle="The real people behind every listing, conversation, and completed sale."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM_MEMBERS.map(member => (
            <Card key={member.role} className="text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-3">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-gold ring-4 ring-gold/15">
                  <member.icon size={26} aria-hidden="true" />
                </span>
                <h3 className="font-serif text-base font-semibold text-ink">{member.role}</h3>
                <p className="text-sm text-ink-muted">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
