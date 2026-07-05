import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import SectionHeading from '@/components/ui/SectionHeading'
import ListingCard from '@/features/listings/ListingCard'
import { useListingsQuery } from '@/features/listings/queries'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

export default function FeaturedListingsSection() {
  const listings = useListingsQuery({ sort: 'newest' })
  const featured = (listings.data?.results ?? []).slice(0, 4)

  return (
    <Section className="bg-primary-soft/30">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            align="left"
            eyebrow="Fresh on the market"
            title="Featured listings"
            subtitle="Hand-picked items recently verified by our brokerage team."
          />
          <Link to="/listings" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            View all listings
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {listings.isLoading && Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)}
          {featured.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
