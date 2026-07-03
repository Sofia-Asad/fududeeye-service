import type { PaymentMethod, PayoutStatus } from '@/types/sales'

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  EVC_PLUS: 'EVC Plus',
  ZAAD: 'Zaad',
  BANK_TRANSFER: 'Bank transfer',
  OTHER: 'Other',
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  'CASH',
  'EVC_PLUS',
  'ZAAD',
  'BANK_TRANSFER',
  'OTHER',
]

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  NA: 'N/A',
  PENDING: 'Pending',
  PAID: 'Paid',
}

export const PAYOUT_STATUSES: PayoutStatus[] = ['PENDING', 'PAID', 'NA']

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value))
}

export function decimalString(value: number) {
  return value.toFixed(2)
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}
