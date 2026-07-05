import { api } from '@/api/client'
import type { PaginatedResponse } from '@/types/service'
import type { Inquiry, InquiryKind, InquiryStatus, InquiryUpdatePayload } from '@/types/inquiry'

export interface InquiryListParams {
  search?: string
  kind?: InquiryKind
  status?: InquiryStatus
  ordering?: string
  page?: number
}

export async function listInquiries(params: InquiryListParams = {}) {
  const response = await api.get<PaginatedResponse<Inquiry>>('/inquiries/', { params })
  return response.data
}

export async function getInquiry(id: number) {
  const response = await api.get<Inquiry>(`/inquiries/${id}/`)
  return response.data
}

export async function updateInquiry(id: number, payload: InquiryUpdatePayload) {
  const response = await api.patch<Inquiry>(`/inquiries/${id}/`, payload)
  return response.data
}

export interface ConvertInquiryResult {
  customer_id: number
  customer_created: boolean
  demand_id: number | null
}

export async function convertInquiry(id: number) {
  const response = await api.post<ConvertInquiryResult>(`/inquiries/${id}/convert/`)
  return response.data
}
