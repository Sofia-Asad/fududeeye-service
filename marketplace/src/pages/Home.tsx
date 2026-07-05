import CategoriesSection from '@/components/home/CategoriesSection'
import FaqPreviewSection from '@/components/home/FaqPreviewSection'
import FeaturedListingsSection from '@/components/home/FeaturedListingsSection'
import FinalCtaSection from '@/components/home/FinalCtaSection'
import HeroSection from '@/components/home/HeroSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import RequestItemSection from '@/components/home/RequestItemSection'
import StatsSection from '@/components/home/StatsSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import WhyChooseSection from '@/components/home/WhyChooseSection'

export default function Home() {
  return (
    <>
      <title>Fududeeye Marketplace — Buy & Sell Quality Second-Hand Goods</title>
      <meta
        name="description"
        content="Fududeeye is a trusted brokerage marketplace to buy and sell verified second-hand electronics, vehicles, furniture, and more across Somalia."
      />

      <HeroSection />
      <CategoriesSection />
      <FeaturedListingsSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <StatsSection />
      <TestimonialsSection />
      <FaqPreviewSection />
      <RequestItemSection />
      <FinalCtaSection />
    </>
  )
}
