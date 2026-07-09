import { ArrowRight, MessageCircle, PackageSearch, ShieldCheck, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'

import Accordion, { type AccordionItemData } from '@/components/ui/Accordion'
import { buttonVariants } from '@/components/ui/Button'
import CtaBanner from '@/components/ui/CtaBanner'
import FeatureCard from '@/components/ui/FeatureCard'
import SectionHeading from '@/components/ui/SectionHeading'
import ServicesHero from '@/components/services/ServicesHero'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const SERVICES = [
  {
    icon: Tag,
    tone: 'gold',
    title: 'Consignment Selling',
    description:
      'Bring us your item and tell us your asking price. We list it, market it, and handle every buyer conversation — you get exactly the price you asked for when it sells.',
  },
  {
    icon: PackageSearch,
    tone: 'info',
    title: 'Item Sourcing',
    description:
      'Looking for something specific that isn’t listed yet? Submit a request with what you need and your budget, and our team will reach out if we can find it.',
  },
  {
    icon: ShieldCheck,
    tone: 'success',
    title: 'Verified Listings',
    description:
      'Every item on the marketplace is reviewed by our team before it goes live — accurate photos, honest condition notes, and current pricing.',
  },
  {
    icon: MessageCircle,
    tone: 'primary',
    title: 'Direct Buyer Support',
    description:
      'Questions about an item go straight to our team over WhatsApp or the contact form — a real person responds, not an automated reply.',
  },
] as const

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
      'Yes — use the "What Do You Need?" form on the homepage, or the Item Sourcing service above, and our team will reach out if we can source it.',
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

const SERVICES_WHATSAPP_MESSAGE = "Hi Fududeeye, I'd like to ask about your services."
const FAQ_WHATSAPP_MESSAGE = "Hi Fududeeye, I have a question that wasn't in your FAQ."

export default function Services() {
  return (
    <>
      <ServicesHero />

      <Container className="py-10">
        <Section className="py-8">
          <SectionHeading eyebrow="What we offer" title="Our Services" subtitle="We don't just list items — we manage the process from intake to sale." />
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {SERVICES.map(service => (
              <FeatureCard
                key={service.title}
                icon={service.icon}
                tone={service.tone}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/listings" className={buttonVariants({ size: 'lg' })}>
              Browse Listings
              <ArrowRight size={18} />
            </Link>
            <a
              href={buildWhatsAppUrl(SERVICES_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noreferrer noopener"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              <MessageCircle size={17} />
              Ask About Selling
            </a>
          </div>
        </Section>

        <Section id="faq" className="scroll-mt-24 py-8">
          <SectionHeading eyebrow="Support" title="Frequently Asked Questions" subtitle="Common questions about buying, selling, and how Fududeeye works." />
          <div className="mx-auto mt-8 max-w-3xl">
            <Accordion items={FAQ_ITEMS} />

            <div className="relative mt-8 overflow-hidden rounded-lg bg-gradient-to-br from-primary via-primary to-primary-deep p-6 text-center shadow-lg">
              <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-white/5 blur-3xl" />
              <p className="relative font-serif text-lg font-semibold text-white">Still have a question?</p>
              <p className="relative mt-1 text-sm text-white/70">Our team is happy to help — reach out any time.</p>
              <a
                href={buildWhatsAppUrl(FAQ_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noreferrer noopener"
                className={`${buttonVariants({ variant: 'secondary', size: 'md' })} relative mt-4`}
              >
                <MessageCircle size={16} />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </Section>
      </Container>

      <CtaBanner
        heading="Ready to Start Trading?"
        description="Join hundreds of customers buying and selling through Fududeeye Brokerage & Marketplace with confidence."
      >
        <Link to="/listings" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
          Browse Listings
          <ArrowRight size={18} />
        </Link>
        <Link
          to="/contact"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'border-white/30 bg-transparent text-white hover:bg-white/10',
          )}
        >
          Contact Our Team
        </Link>
      </CtaBanner>
    </>
  )
}
