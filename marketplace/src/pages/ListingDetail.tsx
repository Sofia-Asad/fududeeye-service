import { useState } from 'react'
import { CalendarDays, ImageOff, MapPin, MessageCircle, MessageSquareText, PackageSearch, ShieldCheck, Tag } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { buttonVariants } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonLines } from '@/components/ui/Skeleton'
import ContactSellerForm from '@/features/inquiries/ContactSellerForm'
import { CONDITION_LABEL, CONDITION_VARIANT } from '@/features/listings/ListingCard'
import ListingCard from '@/features/listings/ListingCard'
import { useDisclosure } from '@/hooks/useDisclosure'
import Container from '@/layout/Container'
import { cn } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { formatCurrency, formatDate } from '@/utils/format'
import { useListingQuery, useListingsQuery } from '@/features/listings/queries'

export default function ListingDetail() {
  const { id } = useParams()
  const listingId = Number(id)
  const validId = Number.isFinite(listingId) && listingId > 0
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const contactForm = useDisclosure()

  const listing = useListingQuery(validId ? listingId : undefined)

  const related = useListingsQuery({
    category: listing.data ? String(listing.data.categoryId) : undefined,
  })

  if (!validId || listing.isError) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<PackageSearch size={20} />}
          title="Listing not found"
          description="This listing may have been sold or removed."
          action={
            <Link to="/listings" className={buttonVariants({ size: 'sm' })}>
              Back to Browse Listings
            </Link>
          }
        />
      </Container>
    )
  }

  if (listing.isLoading || !listing.data) {
    return (
      <Container className="py-10">
        <SkeletonLines widths={['30%', '80%', '60%']} />
      </Container>
    )
  }

  const current = listing.data
  const images = current.images
  const activeImage = images[activeImageIndex] ?? images[0]
  const whatsAppMessage = `Hi Fududeeye, I'm interested in "${current.title}" (Listing #${current.id}). Is it still available?`
  const relatedListings = (related.data?.results ?? []).filter(item => item.id !== current.id).slice(0, 4)

  return (
    <>
      <div className="border-b border-border bg-surface py-4">
        <Container>
          <Breadcrumb items={[{ label: 'Browse listings', to: '/listings' }, { label: current.title }]} />
        </Container>
      </div>

      <Container className="py-10">
        <div className="grid animate-fade-in gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-md">
              {activeImage ? (
                <img src={activeImage.url} alt={current.title} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="grid aspect-[4/3] w-full place-items-center bg-primary-soft text-ink-faint">
                  <ImageOff size={40} aria-hidden="true" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      'aspect-square overflow-hidden rounded-md border-2 transition-colors',
                      index === activeImageIndex ? 'border-primary' : 'border-transparent hover:border-border-strong',
                    )}
                  >
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-10">
              <h2 className="font-serif text-xl font-semibold text-ink">Description</h2>
              <p className="mt-3 leading-relaxed text-ink-muted">{current.description || 'No description provided.'}</p>
            </div>

            {current.attributes.length > 0 && (
              <div className="mt-8">
                <h2 className="font-serif text-xl font-semibold text-ink">Specifications</h2>
                <dl className="mt-3 grid gap-x-6 gap-y-3 rounded-xl border border-border bg-surface p-5 shadow-sm sm:grid-cols-2">
                  {current.attributes.map(spec => (
                    <div key={spec.label} className="flex justify-between gap-4 text-sm sm:justify-start">
                      <dt className="font-medium text-ink-muted">{spec.label}</dt>
                      <dd className="text-ink">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {relatedListings.length > 0 && (
              <div className="mt-10">
                <h2 className="font-serif text-xl font-semibold text-ink">Related listings</h2>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  {relatedListings.map(item => (
                    <ListingCard key={item.id} listing={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden rounded-xl border-t-4 border-t-gold shadow-lg">
              <CardContent className="grid gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={CONDITION_VARIANT[current.condition]}>{CONDITION_LABEL[current.condition]}</Badge>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                    <Tag size={12} aria-hidden="true" />
                    {current.categoryName}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                    <ShieldCheck size={12} aria-hidden="true" />
                    Verified
                  </span>
                </div>

                <h1 className="font-serif text-2xl font-semibold text-ink">{current.title}</h1>
                <p className="font-serif text-3xl font-semibold text-primary">{formatCurrency(current.price)}</p>

                <div className="grid gap-1.5 text-sm text-ink-muted">
                  {current.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} aria-hidden="true" />
                      {current.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} aria-hidden="true" />
                    Posted {formatDate(current.createdAt)}
                  </span>
                </div>

                <a
                  href={buildWhatsAppUrl(whatsAppMessage)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(buttonVariants({ size: 'lg' }), 'mt-2 w-full')}
                >
                  <MessageCircle size={18} />
                  Chat on WhatsApp
                </a>
                <p className="text-center text-xs text-ink-faint">
                  Opens WhatsApp with this item&rsquo;s details pre-filled.
                </p>

                {contactForm.isOpen ? (
                  <div className="mt-2 border-t border-border pt-4">
                    <ContactSellerForm itemId={String(current.id)} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={contactForm.open}
                    className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mt-1 w-full')}
                  >
                    <MessageSquareText size={15} />
                    Send a Message Instead
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </>
  )
}
