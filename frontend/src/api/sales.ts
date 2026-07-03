import { api } from '@/api/client'
import type {
  MarkPaidPayload,
  PaymentMethod,
  PayoutStatus,
  PendingPayoutsResponse,
  Sale,
  SalePayload,
  PaginatedResponse,
} from '@/types/sales'

export interface SaleListParams {
  search?: string
  item?: number
  buyer?: number
  handled_by?: number
  payment_method?: PaymentMethod
  payout_status?: PayoutStatus
  ordering?: string
  page?: number
}

export async function listSales(params: SaleListParams = {}) {
  const response = await api.get<PaginatedResponse<Sale>>('/sales/', { params })
  return response.data
}

export async function getSale(id: number) {
  const response = await api.get<Sale>(`/sales/${id}/`)
  return response.data
}

export async function createSale(payload: SalePayload) {
  const response = await api.post<Sale>('/sales/', payload)
  return response.data
}

export async function markSalePaid(id: number, payload: MarkPaidPayload) {
  const response = await api.post<Sale>(`/sales/${id}/mark-paid/`, payload)
  return response.data
}

export async function listPendingPayouts() {
  const response = await api.get<PendingPayoutsResponse>('/reports/pending-payouts/')
  return response.data
}
