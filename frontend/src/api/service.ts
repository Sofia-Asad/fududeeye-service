import { api } from '@/api/client'
import type {
  Complaint,
  ComplaintPayload,
  ComplaintPriority,
  ComplaintStatus,
  Demand,
  DemandPayload,
  DemandStatus,
  PaginatedResponse,
  SuggestedMatch,
} from '@/types/service'
import type { AuditLogRow } from '@/types/reports'

export interface DemandListParams {
  search?: string
  customer?: number
  category?: number
  status?: DemandStatus
  matched_item?: number
  ordering?: string
  page?: number
}

export interface ComplaintListParams {
  search?: string
  customer?: number
  related_sale?: number
  status?: ComplaintStatus
  priority?: ComplaintPriority
  assigned_to?: number
  ordering?: string
  page?: number
}

export async function listDemands(params: DemandListParams = {}) {
  const response = await api.get<PaginatedResponse<Demand>>('/demands/', { params })
  return response.data
}

export async function getDemand(id: number) {
  const response = await api.get<Demand>(`/demands/${id}/`)
  return response.data
}

export async function createDemand(payload: DemandPayload) {
  const response = await api.post<Demand>('/demands/', payload)
  return response.data
}

export async function updateDemand(id: number, payload: DemandPayload) {
  const response = await api.patch<Demand>(`/demands/${id}/`, payload)
  return response.data
}

export async function listSuggestedMatches(id: number) {
  const response = await api.get<SuggestedMatch[]>(`/demands/${id}/suggested-matches/`)
  return response.data
}

export async function getDemandHistory(id: number) {
  const response = await api.get<{ results: AuditLogRow[] }>(`/demands/${id}/history/`)
  return response.data.results
}

export async function listComplaints(params: ComplaintListParams = {}) {
  const response = await api.get<PaginatedResponse<Complaint>>('/complaints/', { params })
  return response.data
}

export async function getComplaint(id: number) {
  const response = await api.get<Complaint>(`/complaints/${id}/`)
  return response.data
}

export async function createComplaint(payload: ComplaintPayload) {
  const response = await api.post<Complaint>('/complaints/', payload)
  return response.data
}

export async function updateComplaint(id: number, payload: ComplaintPayload) {
  const response = await api.patch<Complaint>(`/complaints/${id}/`, payload)
  return response.data
}

export async function getComplaintHistory(id: number) {
  const response = await api.get<{ results: AuditLogRow[] }>(`/complaints/${id}/history/`)
  return response.data.results
}
