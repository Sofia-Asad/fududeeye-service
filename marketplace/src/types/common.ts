/** Shared response envelope shape matching the Django REST Framework backend's pagination. */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
