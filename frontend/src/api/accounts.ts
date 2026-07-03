import { api } from '@/api/client'
import type { User } from '@/types/auth'

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface UserListParams {
  search?: string
  ordering?: string
  page?: number
}

export async function listUsers(params: UserListParams = {}) {
  const response = await api.get<PaginatedResponse<User>>('/users/', { params })
  return response.data
}
