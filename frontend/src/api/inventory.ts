import { api } from '@/api/client'
import type {
  Category,
  CategoryKind,
  CategoryPayload,
  Item,
  ItemImage,
  ItemPayload,
  ItemStatus,
  OwnerType,
  PaginatedResponse,
} from '@/types/inventory'

export interface CategoryListParams {
  kind?: CategoryKind
  parent?: number | null
  search?: string
  ordering?: string
  page?: number
}

export interface ItemListParams {
  search?: string
  category?: number
  owner_type?: OwnerType
  status?: ItemStatus
  condition?: string
  ordering?: string
  page?: number
}

export async function listCategories(params: CategoryListParams = {}) {
  const response = await api.get<PaginatedResponse<Category>>('/categories/', { params })
  return response.data
}

export async function createCategory(payload: CategoryPayload) {
  const response = await api.post<Category>('/categories/', payload)
  return response.data
}

export async function listItems(params: ItemListParams = {}) {
  const response = await api.get<PaginatedResponse<Item>>('/items/', { params })
  return response.data
}

export async function getItem(id: number) {
  const response = await api.get<Item>(`/items/${id}/`)
  return response.data
}

export async function createItem(payload: ItemPayload) {
  const response = await api.post<Item>('/items/', payload)
  return response.data
}

export async function updateItem(id: number, payload: ItemPayload) {
  const response = await api.patch<Item>(`/items/${id}/`, payload)
  return response.data
}

export async function deleteItem(id: number) {
  await api.delete(`/items/${id}/`)
}

export async function uploadItemImage(itemId: number, file: File) {
  const formData = new FormData()
  formData.append('image', file)
  const response = await api.post<ItemImage>(`/items/${itemId}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function deleteItemImage(itemId: number, imageId: number) {
  await api.delete(`/items/${itemId}/images/${imageId}/`)
}
