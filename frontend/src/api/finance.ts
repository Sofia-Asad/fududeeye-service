import { api } from '@/api/client'
import type {
  Expense,
  ExpenseCategory,
  ExpenseCategoryPayload,
  ExpensePayload,
  PaginatedResponse,
} from '@/types/finance'
import type { AuditLogRow } from '@/types/reports'
import type { PaymentMethod } from '@/types/sales'

export interface ExpenseCategoryListParams {
  is_active?: boolean
  search?: string
  ordering?: string
  page?: number
}

export interface ExpenseListParams {
  search?: string
  category?: number
  payment_method?: PaymentMethod
  expense_date?: string
  start?: string
  end?: string
  ordering?: string
  page?: number
}

export async function listExpenseCategories(params: ExpenseCategoryListParams = {}) {
  const response = await api.get<PaginatedResponse<ExpenseCategory>>('/expense-categories/', { params })
  return response.data
}

export async function createExpenseCategory(payload: ExpenseCategoryPayload) {
  const response = await api.post<ExpenseCategory>('/expense-categories/', payload)
  return response.data
}

export async function listExpenses(params: ExpenseListParams = {}) {
  const response = await api.get<PaginatedResponse<Expense>>('/expenses/', { params })
  return response.data
}

export async function createExpense(payload: ExpensePayload) {
  const response = await api.post<Expense>('/expenses/', payload)
  return response.data
}

export async function getExpense(id: number) {
  const response = await api.get<Expense>(`/expenses/${id}/`)
  return response.data
}

export async function updateExpense(id: number, payload: Partial<ExpensePayload>) {
  const response = await api.patch<Expense>(`/expenses/${id}/`, payload)
  return response.data
}

export async function deleteExpense(id: number) {
  await api.delete(`/expenses/${id}/`)
}

export async function getExpenseHistory(id: number) {
  const response = await api.get<{ results: AuditLogRow[] }>(`/expenses/${id}/history/`)
  return response.data.results
}
