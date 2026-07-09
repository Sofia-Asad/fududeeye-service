import {
  BadgeCheck,
  Briefcase,
  Crown,
  Handshake,
  Headset,
  HeartHandshake,
  Lightbulb,
  Lock,
  MapPin,
  PackagePlus,
  PartyPopper,
  Scale,
  Settings,
  ShieldCheck,
  Tags,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

import type { IconTone } from '@/lib/toneStyles'

export interface StoryStat {
  value: number
  suffix: string
  label: string
}

export interface FeatureItem {
  icon: LucideIcon
  tone: IconTone
  title: string
  description: string
}

export interface WorkStep {
  step: number
  icon: LucideIcon
  title: string
  description: string
}

export interface TeamMember {
  icon: LucideIcon
  role: string
  description: string
}

export const STORY_STATS: StoryStat[] = [
  { value: 500, suffix: '+', label: 'Happy Customers' },
  { value: 1500, suffix: '+', label: 'Verified Listings' },
  { value: 250, suffix: '+', label: 'Successful Transactions' },
  { value: 98, suffix: '%', label: 'Customer Satisfaction' },
]

export const IMPACT_STATS: StoryStat[] = [
  { value: 1500, suffix: '+', label: 'Listings Managed' },
  { value: 500, suffix: '+', label: 'Satisfied Customers' },
  { value: 250, suffix: '+', label: 'Successful Sales' },
  { value: 98, suffix: '%', label: 'Customer Satisfaction' },
]

export const CORE_VALUES: FeatureItem[] = [
  {
    icon: ShieldCheck,
    tone: 'success',
    title: 'Trust',
    description: 'Every listing is reviewed with honesty and transparency.',
  },
  {
    icon: Briefcase,
    tone: 'primary',
    title: 'Professionalism',
    description: 'Experienced people providing excellent customer service.',
  },
  {
    icon: HeartHandshake,
    tone: 'gold',
    title: 'Customer First',
    description: 'Our customers remain at the center of every decision.',
  },
  {
    icon: Lightbulb,
    tone: 'info',
    title: 'Innovation',
    description: 'Using technology to continuously improve the marketplace experience.',
  },
]

export const HOW_FUDUDEEYE_WORKS_STEPS: WorkStep[] = [
  {
    step: 1,
    icon: PackagePlus,
    title: 'Seller Brings an Item',
    description: 'A seller reaches out with an item and their asking price.',
  },
  {
    step: 2,
    icon: BadgeCheck,
    title: 'Item Verification',
    description: 'Our team reviews the item’s condition, photos, and pricing.',
  },
  {
    step: 3,
    icon: Tags,
    title: 'Professional Listing',
    description: 'The item is listed on the marketplace with accurate details.',
  },
  {
    step: 4,
    icon: Handshake,
    title: 'Buyer Connection',
    description: 'Interested buyers reach out and our team manages the conversation.',
  },
  {
    step: 5,
    icon: PartyPopper,
    title: 'Successful Transaction',
    description: 'Buyer and seller complete a safe, satisfying transaction.',
  },
]

export const WHY_CHOOSE_ABOUT: FeatureItem[] = [
  {
    icon: BadgeCheck,
    tone: 'success',
    title: 'Verified Listings',
    description: 'Every listing is reviewed before publication.',
  },
  {
    icon: Briefcase,
    tone: 'primary',
    title: 'Professional Brokerage',
    description: 'We actively assist buyers and sellers.',
  },
  {
    icon: Lock,
    tone: 'info',
    title: 'Secure Transactions',
    description: 'Helping customers trade with confidence.',
  },
  {
    icon: Headset,
    tone: 'gold',
    title: 'Fast Customer Support',
    description: 'Quick responses during business hours.',
  },
  {
    icon: Scale,
    tone: 'success',
    title: 'Fair Pricing',
    description: 'Transparent and honest brokerage.',
  },
  {
    icon: MapPin,
    tone: 'primary',
    title: 'Local Expertise',
    description: 'Built for the Somali marketplace.',
  },
]

export const TEAM_MEMBERS: TeamMember[] = [
  {
    icon: Crown,
    role: 'Founder & Manager',
    description: 'Leads the brokerage and sets the standard for every transaction.',
  },
  {
    icon: Settings,
    role: 'Marketplace Operations',
    description: 'Reviews and manages every listing on the marketplace.',
  },
  {
    icon: TrendingUp,
    role: 'Sales Team',
    description: 'Connects buyers and sellers and helps close every deal.',
  },
  {
    icon: Headset,
    role: 'Customer Support',
    description: 'Responds to inquiries and supports customers every step of the way.',
  },
]
