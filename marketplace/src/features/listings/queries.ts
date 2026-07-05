import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchCategories, fetchListing, fetchListings, type ListingQueryParams } from '@/api/listings'

export function useListingsQuery(params: ListingQueryParams) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => fetchListings(params),
    placeholderData: keepPreviousData,
  })
}

export function useListingQuery(id: number | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id as number),
    enabled: id !== undefined && Number.isFinite(id),
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  })
}
