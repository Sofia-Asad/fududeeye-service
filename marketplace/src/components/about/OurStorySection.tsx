import { Card, CardContent } from '@/components/ui/Card'
import SectionHeading from '@/components/ui/SectionHeading'
import StatCounter from '@/components/ui/StatCounter'
import { STORY_STATS } from '@/components/about/aboutContent'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

export default function OurStorySection() {
  return (
    <Section className="py-8">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <SectionHeading align="left" title="Our Story" />
            <div className="mt-5 grid gap-4 text-ink-muted">
              <p>
                Fududeeye Brokerage &amp; Marketplace was established to transform the way people buy and sell
                products across Somalia.
              </p>
              <p>
                Many valuable products remain unused while others struggle to find affordable alternatives.
                Our goal is to bridge that gap through a trusted brokerage model that connects buyers and
                sellers safely and professionally.
              </p>
              <p>
                Unlike traditional listing websites, Fududeeye actively assists customers throughout the
                entire buying and selling journey. Every listing is carefully reviewed, managed, and supported
                by our team to create a transparent and trustworthy marketplace.
              </p>
              <p>
                We believe that technology should simplify business, strengthen trust, and create
                opportunities for everyone.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {STORY_STATS.map(stat => (
              <Card key={stat.label} className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardContent className="py-8">
                  <StatCounter value={stat.value} suffix={stat.suffix} label={stat.label} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
