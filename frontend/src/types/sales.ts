export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type PaymentMethod = 'CASH' | 'EVC_PLUS' | 'ZAAD' | 'BANK_TRANSFER' | 'OTHER'
export type PayoutStatus = 'NA' | 'PENDING' | 'PAID'

export interface Sale {
  id: number
  item: number
  item_title: string
  item_owner_type: 'COMPANY' | 'CONSIGNMENT'
  item_owner_name: string | null
  item_listed_price: string
  item_owner_asking_price: string | null
  item_cost_price: string | null
  buyer: number
  buyer_name: string
  quantity_sold: number
  sale_price: string
  sale_date: string
  payment_method: PaymentMethod
  handled_by: number
  handled_by_name: string
  notes: string
  owner_payout_amount: string
  company_profit: string
  payout_status: PayoutStatus
  payout_method: PaymentMethod | ''
  payout_date: string | null
  payout_handled_by: number | null
  payout_handled_by_name: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface SalePayload {
  item: number
  buyer: number
  quantity_sold: number
  sale_price: string
  sale_date: string
  payment_method: PaymentMethod
  handled_by: number
  notes: string
}

export interface MarkPaidPayload {
  payout_method: PaymentMethod
  payout_date: string
  payout_handled_by: number
}

export interface PendingPayoutRow {
  sale_id: number
  owner_id: number | null
  owner: string
  item: string
  sale_date: string
  amount: string
}

export interface PendingPayoutsResponse {
  count: number
  total: string
  results: PendingPayoutRow[]
}
