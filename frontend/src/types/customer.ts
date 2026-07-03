export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Customer {
  id: number
  full_name: string
  phone: string
  alternate_phone: string
  email: string
  address: string
  notes: string
  is_active: boolean
  is_seller: boolean
  is_buyer: boolean
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface CustomerPayload {
  full_name: string
  phone: string
  alternate_phone: string
  email: string
  address: string
  notes: string
  is_active: boolean
}

export interface ItemSummary {
  id: number
  title: string
  owner_type: 'COMPANY' | 'CONSIGNMENT'
  owner: number | null
  owner_asking_price: string | null
  listed_price: string
  quantity: number
  quantity_sold: number
  quantity_available: number
  condition: string
  location: string
  status: string
  created_at: string
}

export interface SaleSummary {
  id: number
  item: number
  buyer: number
  quantity_sold: number
  sale_price: string
  sale_date: string
  payment_method: string
  handled_by: number
  owner_payout_amount: string
  company_profit: string
  payout_status: string
}

export interface DemandSummary {
  id: number
  customer: number
  title: string
  target_price_min: string | null
  target_price_max: string | null
  status: string
  matched_item: number | null
  created_at: string
}

export interface ComplaintSummary {
  id: number
  ticket_number: string
  customer: number
  subject: string
  status: string
  priority: string
  resolved_at: string | null
  created_at: string
}
