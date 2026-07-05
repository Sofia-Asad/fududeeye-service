import { api } from '@/api/client'
import type {
  Category,
  CategoryKind,
  Listing,
  ListingCondition,
  PaginatedListings,
  SortOption,
} from '@/features/listings/types'

/** Matches backend/config/settings/base.py REST_FRAMEWORK['PAGE_SIZE'] — not client-overridable. */
export const LISTINGS_PAGE_SIZE = 25

const SORT_TO_ORDERING: Record<SortOption, string> = {
  newest: '-created_at',
  oldest: 'created_at',
  'price-asc': 'listed_price',
  'price-desc': '-listed_price',
}

export interface ListingQueryParams {
  q?: string
  category?: string
  condition?: string
  minPrice?: string
  maxPrice?: string
  sort?: SortOption
  page?: number
}

interface RawItemImage {
  id: number
  image: string
  is_primary: boolean
  order: number
}

interface RawItem {
  id: number
  title: string
  description: string
  category: number
  category_name: string
  category_kind: CategoryKind
  listed_price: string
  condition: ListingCondition
  location: string
  attributes: Record<string, string | number | boolean>
  images: RawItemImage[]
  created_at: string
}

interface RawPaginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface RawCategory {
  id: number
  name: string
  parent: number | null
  kind: CategoryKind
  active_item_count: number
}

function humanizeAttributeLabel(key: string) {
  return key
    .replaceAll('_', ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

function mapItem(raw: RawItem): Listing {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    categoryId: raw.category,
    categoryName: raw.category_name,
    categoryKind: raw.category_kind,
    price: Number(raw.listed_price),
    condition: raw.condition,
    location: raw.location,
    attributes: Object.entries(raw.attributes ?? {}).map(([key, value]) => ({
      label: humanizeAttributeLabel(key),
      value: String(value),
    })),
    images: raw.images
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(image => ({ id: image.id, url: image.image, isPrimary: image.is_primary, order: image.order })),
    createdAt: raw.created_at,
  }
}

function mapCategory(raw: RawCategory): Category {
  return {
    id: raw.id,
    name: raw.name,
    parent: raw.parent,
    kind: raw.kind,
    activeItemCount: raw.active_item_count,
  }
}

export async function fetchListings(params: ListingQueryParams): Promise<PaginatedListings> {
  const response = await api.get<RawPaginated<RawItem>>('/public/items/', {
    params: {
      search: params.q || undefined,
      category: params.category || undefined,
      condition: params.condition || undefined,
      price_min: params.minPrice || undefined,
      price_max: params.maxPrice || undefined,
      ordering: SORT_TO_ORDERING[params.sort ?? 'newest'],
      page: params.page,
    },
  })
  return {
    results: response.data.results.map(mapItem),
    count: response.data.count,
    next: response.data.next,
    previous: response.data.previous,
  }
}

export async function fetchListing(id: number): Promise<Listing> {
  const response = await api.get<RawItem>(`/public/items/${id}/`)
  return mapItem(response.data)
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<RawPaginated<RawCategory>>('/public/categories/')
  return response.data.results.map(mapCategory)
}
