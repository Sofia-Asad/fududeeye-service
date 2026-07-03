import type { PaymentMethod } from '@/types/sales'

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ExpenseCategory {
  id: number
  name: string
  description: string
  is_active: boolean
}

export interface Expense {
  id: number
  category: number
  category_name: string
  amount: string
  expense_date: string
  payment_method: PaymentMethod
  description: string
  receipt: string | null
  notes: string
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface ExpenseCategoryPayload {
  name: string
  description: string
  is_active?: boolean
}

export interface ExpensePayload {
  category: number
  amount: string
  expense_date: string
  payment_method: PaymentMethod
  description: string
  notes: string
}
