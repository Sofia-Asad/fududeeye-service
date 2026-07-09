import { ArrowRight, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import CtaBanner from '@/components/ui/CtaBanner'
import AboutHero from '@/components/about/AboutHero'
import CoreValuesSection from '@/components/about/CoreValuesSection'
import HowFududeeyeWorksSection from '@/components/about/HowFududeeyeWorksSection'
import ImpactSection from '@/components/about/ImpactSection'
import MissionVisionSection from '@/components/about/MissionVisionSection'
import OurStorySection from '@/components/about/OurStorySection'
import TeamSection from '@/components/about/TeamSection'
import WhyChooseAboutSection from '@/components/about/WhyChooseAboutSection'
import { cn } from '@/lib/utils'

export default function About() {
  return (
    <>
      <AboutHero />
      <OurStorySection />
      <MissionVisionSection />
      <CoreValuesSection />
      <HowFududeeyeWorksSection />
      <WhyChooseAboutSection />
      <ImpactSection />
      <TeamSection />

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
          <MessageCircle size={17} />
          Contact Our Team
        </Link>
      </CtaBanner>
    </>
  )
}
