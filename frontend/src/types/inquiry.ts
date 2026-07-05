export type InquiryKind = 'ITEM_INTEREST' | 'ITEM_REQUEST' | 'GENERAL'
export type InquiryStatus = 'NEW' | 'CONTACTED' | 'CLOSED'

export interface Inquiry {
  id: number
  kind: InquiryKind
  full_name: string
  phone: string
  email: string
  message: string
  item: number | null
  item_title: string | null
  item_needed: string
  category: number | null
  category_name: string | null
  status: InquiryStatus
  handled_by: number | null
  handled_by_name: string | null
  staff_notes: string
  created_at: string
  updated_at: string
}

export interface InquiryUpdatePayload {
  status?: InquiryStatus
  handled_by?: number | null
  staff_notes?: string
}
