import { Quote } from 'lucide-react'

import Avatar from '@/components/ui/Avatar'
import { Card, CardContent } from '@/components/ui/Card'
import Rating from '@/components/ui/Rating'
import SectionHeading from '@/components/ui/SectionHeading'
import { TESTIMONIALS } from '@/components/home/homeContent'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

export default function TestimonialsSection() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by buyers and sellers"
          subtitle="Real people, real deals, real peace of mind."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map(testimonial => (
            <Card key={testimonial.name} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col">
                <figure className="flex flex-1 flex-col gap-4">
                  <Quote size={28} aria-hidden="true" className="text-gold" />
                  <Rating value={testimonial.rating} />
                  <blockquote className="flex-1 text-ink-muted">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                  <figcaption className="flex items-center gap-3 border-t border-border pt-4">
                    <Avatar name={testimonial.name} />
                    <span>
                      <span className="block font-semibold text-ink">{testimonial.name}</span>
                      <span className="block text-sm text-ink-muted">{testimonial.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  )
}
