import type { PaymentMethod, PayoutStatus, Sale } from '@/types/sales'

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

/** Exports the currently-loaded sale rows as a CSV file (opens natively in Excel) — client-side only, no backend export endpoint exists. */
export function exportSalesToCsv(rows: Sale[], filename = 'sales-export.csv') {
  const headers = ['Sale ID', 'Item', 'Buyer', 'Quantity', 'Sale Price', 'Payment Method', 'Company Profit', 'Owner Payout', 'Payout Status', 'Sale Date', 'Handled By']
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const lines = rows.map(sale => [
    sale.id,
    sale.item_title,
    sale.buyer_name,
    sale.quantity_sold,
    sale.sale_price,
    PAYMENT_METHOD_LABELS[sale.payment_method],
    sale.company_profit,
    sale.owner_payout_amount,
    PAYOUT_STATUS_LABELS[sale.payout_status],
    sale.sale_date,
    sale.handled_by_name,
  ].map(value => escape(String(value))).join(','))

  const csv = [headers.map(escape).join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
