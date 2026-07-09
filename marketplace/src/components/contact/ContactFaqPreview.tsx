import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import Accordion, { type AccordionItemData } from '@/components/ui/Accordion'
import { buttonVariants } from '@/components/ui/Button'
import SectionHeading from '@/components/ui/SectionHeading'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const PREVIEW_FAQ_ITEMS: AccordionItemData[] = [
  {
    question: 'How do I buy an item?',
    answer: 'Browse listings, open the one you like, and use "Chat on WhatsApp" or "Send a Message" to reach our team — we\'ll confirm availability and arrange the purchase.',
  },
  {
    question: 'How do I sell my item?',
    answer: 'Fududeeye works as a brokerage, not a self-listing platform — bring your item to our team with your asking price, and we handle listing it, marketing it, and managing buyer conversations.',
  },
  {
    question: 'How can I contact a seller?',
    answer: 'You don\'t contact sellers directly — our team manages every conversation on their behalf, so you always get a fast, professional response.',
  },
  {
    question: 'How does payment work?',
    answer: 'Payment and delivery details are worked out directly with our team once you get in touch about a listing — we\'ll walk you through the options available for that item.',
  },
]

export default function ContactFaqPreview() {
  return (
    <Section className="py-8">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="Support" title="Frequently Asked Questions" />
        <div className="mt-8">
          <Accordion items={PREVIEW_FAQ_ITEMS} />
        </div>
        <div className="mt-6 flex justify-center">
          <Link to="/faq" className={buttonVariants({ variant: 'outline', size: 'md' })}>
            View All FAQs
            <ArrowRight size={16} />
          </Link>
        </div>
      </Container>
    </Section>
  )
}
