import { useEffect, useRef, useState } from 'react'
import { LayoutGrid, List as ListIcon, PackageSearch, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { LISTINGS_PAGE_SIZE } from '@/api/listings'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import FilterBar from '@/components/ui/FilterBar'
import Input from '@/components/ui/Input'
import PageTitle from '@/components/ui/PageTitle'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import Select from '@/components/ui/Select'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { CONDITION_LABEL } from '@/features/listings/ListingCard'
import ListingCard from '@/features/listings/ListingCard'
import { SORT_OPTIONS } from '@/features/listings/placeholderData'
import { useCategoriesQuery, useListingsQuery } from '@/features/listings/queries'
import type { ListingCondition, ListingFilters, SortOption } from '@/features/listings/types'
import { useDisclosure } from '@/hooks/useDisclosure'
import Container from '@/layout/Container'
import { cn } from '@/lib/utils'

const CONDITION_OPTIONS: { value: ListingCondition; label: string }[] = [
  { value: 'NEW', label: CONDITION_LABEL.NEW },
  { value: 'USED', label: CONDITION_LABEL.USED },
  { value: 'REFURBISHED', label: CONDITION_LABEL.REFURBISHED },
]

const VALID_SORTS: SortOption[] = ['newest', 'oldest', 'price-asc', 'price-desc']

function readFilters(params: URLSearchParams): ListingFilters {
  const sort = params.get('sort')
  return {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    condition: params.get('condition') ?? '',
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    sort: VALID_SORTS.includes(sort as SortOption) ? (sort as SortOption) : 'newest',
    page: Number(params.get('page')) || 1,
  }
}

function writeFilters(filters: ListingFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.condition) params.set('condition', filters.condition)
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}

export default function BrowseListings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams)

  const [searchDraft, setSearchDraft] = useState(filters.q)
  const [minPriceDraft, setMinPriceDraft] = useState(filters.minPrice)
  const [maxPriceDraft, setMaxPriceDraft] = useState(filters.maxPrice)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const mobileFilters = useDisclosure()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  const categories = useCategoriesQuery()
  const listings = useListingsQuery({
    q: filters.q || undefined,
    category: filters.category || undefined,
    condition: filters.condition || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    sort: filters.sort,
    page: filters.page,
  })

  function updateFilters(patch: Partial<ListingFilters>) {
    setSearchParams(writeFilters({ ...filters, ...patch }))
  }

  function scheduleFilterUpdate(patch: Partial<ListingFilters>) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateFilters({ ...patch, page: 1 }), 400)
  }

  function clearFilters() {
    setSearchDraft('')
    setMinPriceDraft('')
    setMaxPriceDraft('')
    setSearchParams(new URLSearchParams())
  }

  const categoryOptions = (categories.data ?? []).map(category => ({
    value: String(category.id),
    label: `${category.name} (${category.activeItemCount})`,
  }))

  const activeChips: { key: string; label: string; onRemove: () => void }[] = []
  if (filters.q) activeChips.push({ key: 'q', label: `"${filters.q}"`, onRemove: () => { setSearchDraft(''); updateFilters({ q: '', page: 1 }) } })
  if (filters.category) {
    const label = categories.data?.find(category => String(category.id) === filters.category)?.name ?? filters.category
    activeChips.push({ key: 'category', label, onRemove: () => updateFilters({ category: '', page: 1 }) })
  }
  if (filters.condition) {
    activeChips.push({
      key: 'condition',
      label: CONDITION_LABEL[filters.condition as ListingCondition] ?? filters.condition,
      onRemove: () => updateFilters({ condition: '', page: 1 }),
    })
  }
  if (filters.minPrice || filters.maxPrice) {
    activeChips.push({
      key: 'price',
      label: `${filters.minPrice ? `$${filters.minPrice}` : '$0'} – ${filters.maxPrice ? `$${filters.maxPrice}` : 'any'}`,
      onRemove: () => { setMinPriceDraft(''); setMaxPriceDraft(''); updateFilters({ minPrice: '', maxPrice: '', page: 1 }) },
    })
  }

  const totalPages = listings.data ? Math.max(1, Math.ceil(listings.data.count / LISTINGS_PAGE_SIZE)) : 1
  const results = listings.data?.results ?? []

  const filterFields = (
    <>
      <SearchInput
        value={searchDraft}
        onChange={value => { setSearchDraft(value); scheduleFilterUpdate({ q: value }) }}
        placeholder="Search listings, description, or location"
        className="min-w-[220px] flex-[2]"
      />
      <Select
        placeholder="All categories"
        options={categoryOptions}
        value={filters.category}
        onChange={event => updateFilters({ category: event.target.value, page: 1 })}
        className="min-w-[160px]"
      />
      <Select
        placeholder="Any condition"
        options={CONDITION_OPTIONS}
        value={filters.condition}
        onChange={event => updateFilters({ condition: event.target.value, page: 1 })}
        className="min-w-[150px]"
      />
      <Input
        type="number"
        inputMode="numeric"
        placeholder="Min $"
        value={minPriceDraft}
        onChange={event => { setMinPriceDraft(event.target.value); scheduleFilterUpdate({ minPrice: event.target.value }) }}
        className="w-24"
      />
      <Input
        type="number"
        inputMode="numeric"
        placeholder="Max $"
        value={maxPriceDraft}
        onChange={event => { setMaxPriceDraft(event.target.value); scheduleFilterUpdate({ maxPrice: event.target.value }) }}
        className="w-24"
      />
      <Select
        options={SORT_OPTIONS}
        value={filters.sort}
        onChange={event => updateFilters({ sort: event.target.value as SortOption, page: 1 })}
        className="min-w-[170px]"
      />
    </>
  )

  return (
    <Container className="py-10">
      <PageTitle
        eyebrow="Marketplace"
        title="Browse listings"
        subtitle="Search and filter items currently available from Fududeeye."
      />

      <div className="mt-8 grid gap-4">
        <div className="hidden lg:block">
          <FilterBar>{filterFields}</FilterBar>
        </div>

        <div className="lg:hidden">
          <button
            type="button"
            onClick={mobileFilters.toggle}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink"
          >
            <SlidersHorizontal size={16} />
            {mobileFilters.isOpen ? 'Hide Filters' : 'Filters & Sort'}
          </button>
          {mobileFilters.isOpen && (
            <div className="mt-3">
              <FilterBar className="flex-col items-stretch">{filterFields}</FilterBar>
            </div>
          )}
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map(chip => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary hover:bg-primary/15"
              >
                {chip.label}
                <X size={13} aria-hidden="true" />
              </button>
            ))}
            <button type="button" onClick={clearFilters} className="text-xs font-semibold text-ink-muted underline hover:text-ink">
              Clear all
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">
            {listings.data ? `${listings.data.count} listing${listings.data.count === 1 ? '' : 's'} found` : 'Loading…'}
          </p>
          <div className="flex gap-1 rounded-md border border-border-strong p-1">
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              className={cn('grid h-8 w-8 place-items-center rounded', view === 'grid' ? 'bg-primary text-white' : 'text-ink-muted')}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
              className={cn('grid h-8 w-8 place-items-center rounded', view === 'list' ? 'bg-primary text-white' : 'text-ink-muted')}
            >
              <ListIcon size={15} />
            </button>
          </div>
        </div>

        {listings.isLoading && (
          <div className={cn('grid gap-6', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
          </div>
        )}

        {listings.isError && (
          <EmptyState
            icon={<PackageSearch size={20} />}
            title="Couldn't load listings"
            description="Something went wrong reaching the marketplace catalog. Please try again."
          />
        )}

        {listings.data && results.length === 0 && (
          <EmptyState
            icon={<PackageSearch size={20} />}
            title="No listings match your filters"
            description="Try adjusting or clearing your filters to see more results."
            action={activeChips.length > 0 ? <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button> : undefined}
          />
        )}

        {listings.data && results.length > 0 && (
          <div className={cn('grid gap-6', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
            {results.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {listings.data && results.length > 0 && (
          <Pagination
            page={filters.page}
            total={totalPages}
            hasPrevious={!!listings.data.previous}
            hasNext={!!listings.data.next}
            onPrevious={() => updateFilters({ page: Math.max(1, filters.page - 1) })}
            onNext={() => updateFilters({ page: filters.page + 1 })}
          />
        )}
      </div>
    </Container>
  )
}
