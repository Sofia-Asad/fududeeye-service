import {
  BadgeCheck,
  Eye,
  Globe,
  Handshake,
  Headphones,
  Lock,
  MessageSquare,
  Search,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface HowItWorksStep {
  step: number
  icon: LucideIcon
  title: string
  description: string
}

export interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
}

export interface MarketplaceStat {
  value: number
  suffix: string
  label: string
}

export interface Testimonial {
  name: string
  role: string
  rating: number
  quote: string
}

export interface FaqItem {
  question: string
  answer: string
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: 1,
    icon: Search,
    title: 'Browse Listings',
    description: 'Explore items added and verified by our team — no account needed.',
  },
  {
    step: 2,
    icon: Eye,
    title: 'View Full Details',
    description: 'See photos, pricing, condition, and location for any item.',
  },
  {
    step: 3,
    icon: MessageSquare,
    title: 'Contact Us',
    description: 'Chat instantly on WhatsApp or send us your details.',
  },
  {
    step: 4,
    icon: Handshake,
    title: 'We Follow Up',
    description: 'Our team responds quickly to help you close the deal.',
  },
]

export const WHY_CHOOSE_FEATURES: FeatureItem[] = [
  {
    icon: BadgeCheck,
    title: 'Verified Listings',
    description: 'Every item is reviewed by our team before it appears on the marketplace.',
  },
  {
    icon: Handshake,
    title: 'Trusted Brokerage',
    description: 'Backed by Fududeeye Brokerage, the name buyers and sellers rely on.',
  },
  {
    icon: Lock,
    title: 'Safe Transactions',
    description: 'We help protect both sides so every deal is secure and transparent.',
  },
  {
    icon: Zap,
    title: 'Always Up to Date',
    description: 'New items are added and verified regularly, so listings stay fresh.',
  },
  {
    icon: Headphones,
    title: 'Professional Support',
    description: 'A responsive team is ready to help you buy or sell with ease.',
  },
  {
    icon: Globe,
    title: 'Wide Marketplace',
    description: 'Reach buyers across every major city with a single listing.',
  },
]

export const MARKETPLACE_STATS: MarketplaceStat[] = [
  { value: 1200, suffix: '+', label: 'Active Listings' },
  { value: 500, suffix: '+', label: 'Customers' },
  { value: 300, suffix: '+', label: 'Completed Sales' },
  { value: 15, suffix: '+', label: 'Categories' },
  { value: 12, suffix: '+', label: 'Cities' },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Aisha Warsame',
    role: 'Sold a laptop · Mogadishu',
    rating: 5,
    quote:
      'I listed my laptop in the morning and a verified buyer contacted me the same day. The whole process felt safe and professional.',
  },
  {
    name: 'Yusuf Ahmed',
    role: 'Bought furniture · Hargeisa',
    rating: 5,
    quote:
      'Fududeeye made it easy to find quality second-hand furniture. Knowing the brokerage checks each listing gave me real peace of mind.',
  },
  {
    name: 'Fatima Nur',
    role: 'Sold a phone · Bosaso',
    rating: 4,
    quote:
      'Fast approval and genuine buyers. This is the first marketplace where I actually trusted the person on the other end.',
  },
]

export const FAQ_PREVIEW: FaqItem[] = [
  {
    question: 'Do I need an account to browse?',
    answer: 'No. Anyone can browse listings and view full item details without creating an account.',
  },
  {
    question: 'How do I contact Fududeeye about an item?',
    answer:
      'Open any listing and tap "Chat on WhatsApp", or use the contact form on the item page — our team will respond directly.',
  },
  {
    question: 'How long does it take to hear back?',
    answer: 'Most inquiries get a response within a few hours during business days.',
  },
  {
    question: "Can I request an item I don't see listed?",
    answer:
      'Yes — use the "What Do You Need?" form on the homepage and our team will reach out if we can source it.',
  },
]
