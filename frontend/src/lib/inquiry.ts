import type { InquiryKind, InquiryStatus } from '@/types/inquiry'

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  CLOSED: 'Closed',
}

export const INQUIRY_STATUSES: InquiryStatus[] = ['NEW', 'CONTACTED', 'CLOSED']

export const INQUIRY_KIND_LABELS: Record<InquiryKind, string> = {
  ITEM_INTEREST: 'Item interest',
  ITEM_REQUEST: 'Item request',
  GENERAL: 'General inquiry',
}
