import type { ComplaintPriority, ComplaintStatus, DemandStatus } from '@/types/service'

export const DEMAND_STATUS_LABELS: Record<DemandStatus, string> = {
  OPEN: 'Open',
  MATCHED: 'Matched',
  FULFILLED: 'Fulfilled',
  DROPPED: 'Dropped',
}

export const DEMAND_STATUSES: DemandStatus[] = ['OPEN', 'MATCHED', 'FULFILLED', 'DROPPED']

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

export const COMPLAINT_STATUSES: ComplaintStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

export const COMPLAINT_PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const COMPLAINT_PRIORITIES: ComplaintPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export function priceRange(min: string | null, max: string | null) {
  if (min && max) {
    return `$${min} - $${max}`
  }
  if (min) {
    return `From $${min}`
  }
  if (max) {
    return `Up to $${max}`
  }
  return '-'
}
