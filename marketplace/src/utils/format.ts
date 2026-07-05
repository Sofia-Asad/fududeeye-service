import { formatDistanceToNow } from 'date-fns'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

export function formatCurrency(value: number | string) {
  return currencyFormatter.format(Number(value))
}

export function formatDate(value: string | Date) {
  return dateFormatter.format(new Date(value))
}

/** Human-friendly relative time, e.g. "3 days ago". */
export function formatRelativeDate(value: string | Date) {
  return formatDistanceToNow(new Date(value), { addSuffix: true })
}
