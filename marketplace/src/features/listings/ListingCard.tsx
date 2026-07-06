import { ImageOff, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

import Badge, { type BadgeProps } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import type { Listing, ListingCondition } from '@/features/listings/types'
import { formatCurrency, formatRelativeDate } from '@/utils/format'

export const CONDITION_VARIANT: Record<ListingCondition, NonNullable<BadgeProps['variant']>> = {
  NEW: 'success',
  USED: 'info',
  REFURBISHED: 'primary',
}

export const CONDITION_LABEL: Record<ListingCondition, string> = {
  NEW: 'New',
  USED: 'Used',
  REFURBISHED: 'Refurbished',
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const primaryImage = listing.images.find(image => image.isPrimary) ?? listing.images[0]

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-primary-soft">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-ink-faint">
            <ImageOff size={28} aria-hidden="true" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant={CONDITION_VARIANT[listing.condition]}>{CONDITION_LABEL[listing.condition]}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-faint">
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-primary">{listing.categoryName}</span>
          <span>{formatRelativeDate(listing.createdAt)}</span>
        </div>

        <h3 className="line-clamp-2 font-serif text-base font-semibold text-ink">{listing.title}</h3>

        {listing.location && (
          <div className="flex items-center gap-1 text-sm text-ink-muted">
            <MapPin size={14} aria-hidden="true" />
            {listing.location}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="font-serif text-lg font-semibold text-primary">{formatCurrency(listing.price)}</span>
          <Link to={`/listings/${listing.id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}
