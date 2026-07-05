import { api } from '@/api/client'
import type { User, UserCreatePayload, UserUpdatePayload } from '@/types/auth'

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

export async function getUser(id: number) {
  const response = await api.get<User>(`/users/${id}/`)
  return response.data
}

export async function createUser(payload: UserCreatePayload) {
  const response = await api.post<User>('/users/', payload)
  return response.data
}

export async function updateUser(id: number, payload: UserUpdatePayload) {
  const response = await api.patch<User>(`/users/${id}/`, payload)
  return response.data
}

export async function resetUserPassword(id: number, newPassword: string) {
  await api.post(`/users/${id}/reset-password/`, { new_password: newPassword })
}
