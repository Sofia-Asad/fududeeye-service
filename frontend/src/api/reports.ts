import { api } from '@/api/client'
import type {
  AuditAction,
  AuditLogReport,
  DashboardReport,
  DemandSupplyReport,
  ExpenseReport,
  ProfitGroupBy,
  ProfitReport,
  SalesReport,
  TopRequestedReport,
} from '@/types/reports'
import type { PaymentMethod } from '@/types/sales'

export interface SalesReportParams {
  start?: string
  end?: string
  category?: number
  payment_method?: PaymentMethod
}

export interface ProfitReportParams extends SalesReportParams {
  group_by?: ProfitGroupBy
}

export interface ExpenseReportParams {
  start?: string
  end?: string
  category?: number
}

export interface AuditLogParams {
  user?: number
  model?: string
  action?: AuditAction
  start?: string
  end?: string
}

export async function getDashboardReport() {
  const response = await api.get<DashboardReport>('/reports/dashboard/')
  return response.data
}

export async function getSalesReport(params: SalesReportParams = {}) {
  const response = await api.get<SalesReport>('/reports/sales/', { params })
  return response.data
}

export async function getProfitReport(params: ProfitReportParams = {}) {
  const response = await api.get<ProfitReport>('/reports/profit/', { params })
  return response.data
}

export async function getExpenseReport(params: ExpenseReportParams = {}) {
  const response = await api.get<ExpenseReport>('/reports/expenses/', { params })
  return response.data
}

export async function getDemandVsSupplyReport() {
  const response = await api.get<DemandSupplyReport>('/reports/demand-vs-supply/')
  return response.data
}

export async function getTopRequestedReport() {
  const response = await api.get<TopRequestedReport>('/reports/top-requested/')
  return response.data
}

export async function getAuditLogReport(params: AuditLogParams = {}) {
  const response = await api.get<AuditLogReport>('/reports/audit-log/', { params })
  return response.data
}
