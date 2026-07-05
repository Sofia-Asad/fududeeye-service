import { api } from '@/api/client'

export type InquiryKind = 'ITEM_INTEREST' | 'ITEM_REQUEST' | 'GENERAL'

export interface CreateInquiryPayload {
  kind: InquiryKind
  fullName: string
  phone: string
  email?: string
  message?: string
  itemId?: string
  itemNeeded?: string
}

export async function createInquiryRequest(payload: CreateInquiryPayload): Promise<void> {
  await api.post('/inquiries/', {
    kind: payload.kind,
    full_name: payload.fullName,
    phone: payload.phone,
    email: payload.email || undefined,
    message: payload.message || undefined,
    item: payload.itemId || undefined,
    item_needed: payload.itemNeeded || undefined,
  })
}
