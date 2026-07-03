import type { PaymentMethod } from '@/types/sales'

export type ProfitGroupBy = 'day' | 'week' | 'month'
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'CUSTOM'

export interface ReportSaleRow {
  id: number
  item: string
  buyer: string
  quantity_sold: number
  sale_price: string
  company_profit: string
  sale_date: string
  payment_method: PaymentMethod
  handled_by: string
}

export interface DashboardPeriod {
  sales_count: number
  income: string
  profit: string
  refunds: string
}

export interface DashboardReport {
  counts: {
    customers: number
    active_items: number
    open_demands: number
    open_complaints: number
    pending_payouts: number
  }
  today_sales_count: number
  today_profit: string
  today: DashboardPeriod
  week: DashboardPeriod
  month: DashboardPeriod
  pending_payouts_total: string
  open_complaints: number
  open_demands: number
  recent_sales: ReportSaleRow[]
}

export interface SalesReport {
  count: number
  gross_sales: string
  refunds: string
  net_sales: string
  profit: string
  results: ReportSaleRow[]
}

export interface ProfitReportRow {
  period: string
  sales: string
  profit: string
  count: number
}

export interface ProfitReport {
  group_by: ProfitGroupBy
  total_profit: string
  results: ProfitReportRow[]
}

export interface ExpenseReportCategoryRow {
  category_id: number
  category: string
  total: string
  count: number
}

export interface ExpenseReport {
  count: number
  total: string
  by_category: ExpenseReportCategoryRow[]
}

export interface DemandSupplyMatch {
  id: number
  title: string
  listed_price: string
}

export interface DemandSupplyRow {
  demand_id: number
  customer: string
  title: string
  category: string | null
  match_count: number
  matches: DemandSupplyMatch[]
}

export interface DemandSupplyReport {
  count: number
  results: DemandSupplyRow[]
}

export interface TopRequestedRow {
  category_id: number | null
  category: string
  count: number
}

export interface TopRequestedReport {
  results: TopRequestedRow[]
}

export interface AuditLogRow {
  id: number
  timestamp: string
  user: string | null
  action: AuditAction
  model_name: string
  object_id: string
  object_repr: string
  changes: Record<string, unknown>
  ip_address: string | null
}

export interface AuditLogReport {
  count: number
  results: AuditLogRow[]
}
