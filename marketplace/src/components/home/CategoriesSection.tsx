import { Building2, Car, Package, Sofa, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import SectionHeading from '@/components/ui/SectionHeading'
import { Skeleton } from '@/components/ui/Skeleton'
import { useCategoriesQuery } from '@/features/listings/queries'
import type { CategoryKind } from '@/features/listings/types'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const KIND_ICON: Record<CategoryKind, LucideIcon> = {
  REAL_ESTATE: Building2,
  VEHICLE: Car,
  ELECTRONICS: Package,
  FURNITURE: Sofa,
  GENERIC: Package,
}

export default function CategoriesSection() {
  const categories = useCategoriesQuery()
  const topLevel = (categories.data ?? []).filter(category => category.parent === null)

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Browse by category"
          title="Explore the marketplace"
          subtitle="Find exactly what you need across our most popular categories."
        />

        {categories.isLoading && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)}
          </div>
        )}

        {topLevel.length > 0 && (
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {topLevel.map(category => {
              const Icon = KIND_ICON[category.kind]
              return (
                <li key={category.id}>
                  <Link
                    to={`/listings?category=${category.id}`}
                    className="group flex h-full items-center gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-gold-soft text-gold-hover transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{category.name}</span>
                      <span className="text-sm text-ink-muted">{category.activeItemCount} listings</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Container>
    </Section>
  )
}
