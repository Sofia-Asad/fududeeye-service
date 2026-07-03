export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type CategoryKind = 'REAL_ESTATE' | 'VEHICLE' | 'ELECTRONICS' | 'FURNITURE' | 'GENERIC'
export type OwnerType = 'COMPANY' | 'CONSIGNMENT'
export type ItemCondition = 'NEW' | 'USED' | 'REFURBISHED'
export type ItemStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'COMPLETED' | 'REFUNDED' | 'WITHDRAWN'

export interface Category {
  id: number
  name: string
  parent: number | null
  kind: CategoryKind
}

export interface ItemImage {
  id: number
  item: number
  image: string
  is_primary: boolean
  order: number
}

export type ItemAttributes = Record<string, string | number | boolean | null>

export interface Item {
  id: number
  title: string
  description: string
  category: number
  category_name: string
  category_kind: CategoryKind
  owner_type: OwnerType
  owner: number | null
  owner_name: string | null
  owner_asking_price: string | null
  cost_price: string | null
  listed_price: string
  quantity: number
  quantity_sold: number
  quantity_available: number
  condition: ItemCondition
  location: string
  status: ItemStatus
  attributes: ItemAttributes
  expected_profit_per_unit: string | null
  images: ItemImage[]
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface ItemPayload {
  title?: string
  description?: string
  category?: number
  owner_type?: OwnerType
  owner?: number | null
  owner_asking_price?: string | null
  cost_price?: string | null
  listed_price?: string
  quantity?: number
  condition?: ItemCondition
  location?: string
  status?: ItemStatus
  attributes?: ItemAttributes
}

export interface CategoryPayload {
  name: string
  parent: number | null
  kind: CategoryKind
}
