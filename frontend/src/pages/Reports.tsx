import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, CalendarDays, ReceiptText, TrendingUp, WalletCards } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import {
  getDashboardReport,
  getDemandVsSupplyReport,
  getExpenseReport,
  getProfitReport,
  getSalesReport,
  getTopRequestedReport,
} from '@/api/reports'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard from '@/components/DirectoryCard'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import SummaryCard from '@/components/SummaryCard'
import { formatDate, todayISO } from '@/lib/sales'
import type { DemandSupplyRow, TopRequestedRow } from '@/types/reports'

const page = { padding: '30px 32px 40px' } as const
const compactMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function monthStartISO() {
  const date = new Date()
  date.setDate(1)
  return date.toISOString().slice(0, 10)
}

function errorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    if (status === 403) return 'You do not have permission to do that.'
    if (status === 401) return 'Please sign in again.'
    return status ? `Request failed (${status}).` : 'Request failed.'
  }
  return 'Request failed.'
}

function moneyTooltip(value: unknown, name: unknown) {
  return [compactMoney.format(Number(value)), String(name)]
}

export default function Reports() {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState(monthStartISO())
  const [endDate, setEndDate] = useState(todayISO())
  const enabled = !!user?.can_view_finance

  const dashboard = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: getDashboardReport,
    enabled,
  })

  const salesReport = useQuery({
    queryKey: ['reports', 'sales', startDate, endDate],
    queryFn: () => getSalesReport({ start: startDate || undefined, end: endDate || undefined }),
    enabled,
  })

  const profitReport = useQuery({
    queryKey: ['reports', 'profit', 'month', startDate, endDate],
    queryFn: () => getProfitReport({ start: startDate || undefined, end: endDate || undefined, group_by: 'month' }),
    enabled,
  })

  const expenseReport = useQuery({
    queryKey: ['reports', 'expenses', startDate, endDate],
    queryFn: () => getExpenseReport({ start: startDate || undefined, end: endDate || undefined }),
    enabled,
  })

  const demandSupply = useQuery({
    queryKey: ['reports', 'demand-vs-supply'],
    queryFn: getDemandVsSupplyReport,
    enabled,
  })

  const topRequested = useQuery({
    queryKey: ['reports', 'top-requested'],
    queryFn: getTopRequestedReport,
    enabled,
  })

  const chartRows = useMemo(
    () => (profitReport.data?.results ?? []).map(row => ({
      period: row.period,
      Sales: Number(row.sales),
      Profit: Number(row.profit),
    })),
    [profitReport.data?.results],
  )

  const topRows = topRequested.data?.results ?? []
  const maxDemandCount = Math.max(1, ...topRows.map(row => row.count))
  const demandRows = (demandSupply.data?.results ?? []).filter(row => row.match_count > 0).slice(0, 5)
  const periodLabel = startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'All available data'

  const demandColumns: Column<DemandSupplyRow>[] = [
    {
      key: 'demand',
      header: 'Demand',
      render: row => (
        <Link to={`/demands/${row.demand_id}`} style={{ color: 'var(--text)', fontWeight: 800, textDecoration: 'none' }}>
          {row.title}
        </Link>
      ),
    },
    { key: 'customer', header: 'Customer', render: row => row.customer },
    { key: 'category', header: 'Category', render: row => row.category || '-' },
    { key: 'matches', header: 'Matches', align: 'right', render: row => row.match_count },
  ]

  const requestedColumns: Column<TopRequestedRow>[] = [
    { key: 'category', header: 'Category', render: row => row.category },
    { key: 'count', header: 'Requests', align: 'right', render: row => row.count },
  ]

  const reportError = dashboard.error || salesReport.error || profitReport.error || expenseReport.error

  return (
    <Layout>
      <PermissionGate minRole="MANAGER" fallback={
        <div style={page}>
          <div className="card" style={{ padding: 22, color: 'var(--muted)', fontSize: 14 }}>Your role cannot view reports.</div>
        </div>
      }>
        <div style={page}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <PageHeader
              eyebrow="Insights"
              title="Reports"
              subtitle={periodLabel}
              actions={(
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <input className="control" type="date" value={startDate} onChange={event => setStartDate(event.target.value)} style={{ padding: '0 12px', minWidth: 148 }} />
                  <input className="control" type="date" value={endDate} onChange={event => setEndDate(event.target.value)} style={{ padding: '0 12px', minWidth: 148 }} />
                </div>
              )}
            />

            {reportError && (
              <div className="error-banner" style={{ marginBottom: 16 }}>{errorMessage(reportError)}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
              <SummaryCard label="Net sales" value={<MoneyDisplay value={salesReport.data?.net_sales ?? 0} />} caption={`${salesReport.data?.count ?? 0} sales`} icon={<WalletCards size={18} />} />
              <SummaryCard label="Profit" value={<MoneyDisplay value={salesReport.data?.profit ?? 0} />} caption="Company markup" icon={<TrendingUp size={18} />} valueColor="var(--success)" />
              <SummaryCard label="Expenses" value={<MoneyDisplay value={expenseReport.data?.total ?? 0} />} caption={`${expenseReport.data?.count ?? 0} rows`} icon={<ReceiptText size={18} />} tone="amber" />
              <SummaryCard label="Pending payouts" value={<MoneyDisplay value={dashboard.data?.pending_payouts_total ?? 0} />} caption={`${dashboard.data?.counts.pending_payouts ?? 0} pending`} icon={<CalendarDays size={18} />} tone="red" valueColor="var(--money-owed)" />
            </div>

            <div className="report-feature-grid" style={{ marginBottom: 16 }}>
              <section className="card" style={{ padding: '18px 18px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800 }}>
                    <BarChart3 size={16} color="var(--primary-hover)" />
                    Profit trend
                  </div>
                  <Link to="/reports/profit" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--primary-hover)', fontSize: 12.5, fontWeight: 800, textDecoration: 'none' }}>
                    Open <ArrowRight size={14} />
                  </Link>
                </div>
                <div style={{ height: 240 }}>
                  {chartRows.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartRows} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                        <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#75806F' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#75806F' }} axisLine={false} tickLine={false} tickFormatter={value => compactMoney.format(Number(value))} />
                        <Tooltip formatter={moneyTooltip} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #ECEADF' }} />
                        <Bar dataKey="Sales" radius={[6, 6, 0, 0]} fill="#E8DDC4" />
                        <Bar dataKey="Profit" radius={[6, 6, 0, 0]} fill="#17795C" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 14 }}>No profit data in this period.</div>
                  )}
                </div>
              </section>

              <section className="card" style={{ padding: '18px' }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Top requested</div>
                {topRows.length > 0 ? (
                  <div style={{ display: 'grid', gap: 13 }}>
                    {topRows.slice(0, 6).map(row => (
                      <div key={row.category_id ?? row.category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{row.category}</span>
                          <span style={{ fontSize: 12.5, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{row.count}</span>
                        </div>
                        <div style={{ height: 7, borderRadius: 999, background: 'var(--neutral-bg)' }}>
                          <div style={{ width: `${Math.max(8, (row.count / maxDemandCount) * 100)}%`, height: '100%', borderRadius: 999, background: 'var(--primary)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ minHeight: 160, display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 14 }}>No demand data yet.</div>
                )}
              </section>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 16 }}>
              {[
                { title: 'Sales report', detail: `${salesReport.data?.count ?? 0} sales`, to: '/reports/sales' },
                { title: 'Profit report', detail: `${profitReport.data?.results.length ?? 0} periods`, to: '/reports/profit' },
                { title: 'Expenses', detail: `${expenseReport.data?.count ?? 0} rows`, to: '/expenses' },
                { title: 'Payouts', detail: `${dashboard.data?.counts.pending_payouts ?? 0} pending`, to: '/sales/payouts' },
              ].map(link => (
                <Link key={link.to} to={link.to} className="card" style={{ padding: '15px 16px', color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 800 }}>{link.title}</div>
                    <div style={{ marginTop: 3, color: 'var(--muted)', fontSize: 12.5 }}>{link.detail}</div>
                  </div>
                  <ArrowRight size={16} color="var(--muted)" />
                </Link>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              <DirectoryCard
                title={(
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <ReceiptText size={16} color="var(--primary-hover)" />
                    Demand matches
                  </span>
                )}
                count={`${demandRows.length} active matches`}
              >
                <DataTable columns={demandColumns} rows={demandRows} empty="No open demands have matches yet." variant="bare" />
              </DirectoryCard>

              <DirectoryCard title="Requested categories" count={`${topRows.length} categories`}>
                <DataTable columns={requestedColumns} rows={topRows.slice(0, 6)} empty="No requested categories yet." variant="bare" />
              </DirectoryCard>
            </div>
          </div>
        </div>
      </PermissionGate>
    </Layout>
  )
}
