import type { Item } from '@/types/inventory'

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type DemandStatus = 'OPEN' | 'MATCHED' | 'FULFILLED' | 'DROPPED'
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Demand {
  id: number
  customer: number
  customer_name: string
  title: string
  description: string
  category: number | null
  category_name: string | null
  target_price_min: string | null
  target_price_max: string | null
  status: DemandStatus
  matched_item: number | null
  matched_item_title: string | null
  notes: string
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface DemandPayload {
  customer?: number
  title?: string
  description?: string
  category?: number | null
  target_price_min?: string | null
  target_price_max?: string | null
  status?: DemandStatus
  matched_item?: number | null
  notes?: string
}

export interface Complaint {
  id: number
  ticket_number: string
  customer: number
  customer_name: string
  related_sale: number | null
  related_sale_label: string | null
  related_sale_item_title: string | null
  subject: string
  description: string
  status: ComplaintStatus
  priority: ComplaintPriority
  assigned_to: number | null
  assigned_to_name: string | null
  resolution_notes: string
  resolved_at: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface ComplaintPayload {
  customer?: number
  related_sale?: number | null
  subject?: string
  description?: string
  status?: ComplaintStatus
  priority?: ComplaintPriority
  assigned_to?: number | null
  resolution_notes?: string
}

export type SuggestedMatch = Item
