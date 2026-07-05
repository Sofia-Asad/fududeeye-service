export type ListingCondition = 'NEW' | 'USED' | 'REFURBISHED'

export type CategoryKind = 'REAL_ESTATE' | 'VEHICLE' | 'ELECTRONICS' | 'FURNITURE' | 'GENERIC'

export type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc'

export interface Category {
  id: number
  name: string
  parent: number | null
  kind: CategoryKind
  activeItemCount: number
}

export interface ListingImage {
  id: number
  url: string
  isPrimary: boolean
  order: number
}

export interface ListingAttribute {
  label: string
  value: string
}

export interface Listing {
  id: number
  title: string
  description: string
  categoryId: number
  categoryName: string
  categoryKind: CategoryKind
  price: number
  condition: ListingCondition
  location: string
  attributes: ListingAttribute[]
  images: ListingImage[]
  createdAt: string
}

export interface ListingFilters {
  q: string
  category: string
  condition: string
  minPrice: string
  maxPrice: string
  sort: SortOption
  page: number
}

export interface PaginatedListings {
  results: Listing[]
  count: number
  next: string | null
  previous: string | null
}
