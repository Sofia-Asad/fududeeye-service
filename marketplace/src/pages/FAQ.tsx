import { MessageCircle } from 'lucide-react'

import Accordion, { type AccordionItemData } from '@/components/ui/Accordion'
import { buttonVariants } from '@/components/ui/Button'
import PageTitle from '@/components/ui/PageTitle'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const FAQ_WHATSAPP_MESSAGE = "Hi Fududeeye, I have a question that wasn't in your FAQ."

const FAQ_ITEMS: AccordionItemData[] = [
  {
    question: 'Do I need an account to browse listings?',
    answer: 'No. Anyone can browse listings and view full item details without creating an account.',
  },
  {
    question: 'How do I contact Fududeeye about an item?',
    answer:
      'Open any listing and tap "Chat on WhatsApp" for an instant conversation, or use the contact form on the item page — our team will respond directly.',
  },
  {
    question: 'How long does it take to hear back?',
    answer: 'Most inquiries get a response within a few hours during business days.',
  },
  {
    question: "Can I request an item I don't see listed?",
    answer:
      'Yes — use the "What Do You Need?" form on the homepage, or the Item Sourcing service, and our team will reach out if we can source it.',
  },
  {
    question: 'How do I sell an item on Fududeeye?',
    answer:
      'Fududeeye works as a brokerage, not a self-listing platform — bring your item to our team (via WhatsApp or the contact form) with your asking price, and we handle listing it, marketing it, and managing buyer conversations.',
  },
  {
    question: 'Are listings verified before they go live?',
    answer:
      'Yes. Every item is reviewed by our team — photos, condition, and pricing are checked before it appears on the marketplace.',
  },
  {
    question: 'What condition are the items in?',
    answer:
      'Each listing shows a condition badge — New, Used, or Refurbished — along with a description so you know exactly what you’re getting.',
  },
  {
    question: 'Do you deliver, or is pickup required?',
    answer:
      'That depends on the item and seller — delivery and pickup details are worked out directly with our team once you get in touch about a listing.',
  },
  {
    question: 'Is there a fee to browse or make an inquiry?',
    answer: 'No. Browsing the marketplace and contacting us about an item or request is completely free.',
  },
]

export default function FAQ() {
  return (
    <Container className="py-10">
      <PageTitle
        eyebrow="Support"
        title="Frequently asked questions"
        subtitle="Common questions about buying, selling, and how Fududeeye works."
      />

      <Section className="max-w-3xl py-8">
        <Accordion items={FAQ_ITEMS} />

        <div className="mt-8 rounded-lg border border-border bg-primary-soft/40 p-6 text-center">
          <p className="font-serif text-lg font-semibold text-ink">Still have a question?</p>
          <p className="mt-1 text-sm text-ink-muted">Our team is happy to help — reach out any time.</p>
          <a
            href={buildWhatsAppUrl(FAQ_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noreferrer noopener"
            className={`${buttonVariants({ size: 'md' })} mt-4`}
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </a>
        </div>
      </Section>
    </Container>
  )
}
