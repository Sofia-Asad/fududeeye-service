import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import Accordion from '@/components/ui/Accordion'
import { buttonVariants } from '@/components/ui/Button'
import SectionHeading from '@/components/ui/SectionHeading'
import { FAQ_PREVIEW } from '@/components/home/homeContent'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const ACCORDION_ITEMS = FAQ_PREVIEW.map(item => ({ question: item.question, answer: item.answer }))

export default function FaqPreviewSection() {
  return (
    <Section className="bg-primary-soft/30">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow="Questions & answers"
          title="Frequently asked questions"
          subtitle="Everything you need to know before you buy or sell."
        />

        <div className="mt-10">
          <Accordion items={ACCORDION_ITEMS} />
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/faq" className={buttonVariants({ variant: 'outline' })}>
            View All FAQs
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </Section>
  )
}
