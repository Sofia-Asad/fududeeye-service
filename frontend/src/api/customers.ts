import { api } from '@/api/client'
import type {
  ComplaintSummary,
  Customer,
  CustomerPayload,
  DemandSummary,
  ItemSummary,
  PaginatedResponse,
  SaleSummary,
} from '@/types/customer'

export interface CustomerListParams {
  search?: string
  is_active?: boolean
  ordering?: string
  page?: number
}

export async function listCustomers(params: CustomerListParams = {}) {
  const response = await api.get<PaginatedResponse<Customer>>('/customers/', { params })
  return response.data
}

export async function getCustomer(id: number) {
  const response = await api.get<Customer>(`/customers/${id}/`)
  return response.data
}

export async function createCustomer(payload: CustomerPayload) {
  const response = await api.post<Customer>('/customers/', payload)
  return response.data
}

export async function updateCustomer(id: number, payload: CustomerPayload) {
  const response = await api.patch<Customer>(`/customers/${id}/`, payload)
  return response.data
}

export async function deleteCustomer(id: number) {
  await api.delete(`/customers/${id}/`)
}

export async function listCustomerItems(customerId: number) {
  const response = await api.get<PaginatedResponse<ItemSummary>>('/items/', {
    params: { owner: customerId, ordering: '-created_at' },
  })
  return response.data
}

export async function listCustomerPurchases(customerId: number) {
  const response = await api.get<PaginatedResponse<SaleSummary>>('/sales/', {
    params: { buyer: customerId, ordering: '-sale_date' },
  })
  return response.data
}

export async function listCustomerDemands(customerId: number) {
  const response = await api.get<PaginatedResponse<DemandSummary>>('/demands/', {
    params: { customer: customerId, ordering: '-created_at' },
  })
  return response.data
}

export async function listCustomerComplaints(customerId: number) {
  const response = await api.get<PaginatedResponse<ComplaintSummary>>('/complaints/', {
    params: { customer: customerId, ordering: '-created_at' },
  })
  return response.data
}
