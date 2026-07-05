import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, Filter, RotateCcw, ShoppingCart, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { listCategories } from '@/api/inventory'
import { getProfitReport } from '@/api/reports'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar } from '@/components/DirectoryCard'
import EmptyState from '@/components/EmptyState'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import SummaryCard from '@/components/SummaryCard'
import { CHART_COLORS, chartAxisTick, chartLegendStyle, chartTooltipStyle, compactMoney, moneyTooltip } from '@/lib/chartTheme'
import { errorMessage } from '@/lib/errors'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, todayISO } from '@/lib/sales'
import type { ProfitGroupBy, ProfitReportRow } from '@/types/reports'
import type { PaymentMethod } from '@/types/sales'

type PaymentFilter = 'all' | PaymentMethod

const page = { padding: '30px 32px 40px' } as const
const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)' } as const

function monthStartISO() {
  const date = new Date()
  date.setDate(1)
  return date.toISOString().slice(0, 10)
}

function periodLabel(period: string, groupBy: ProfitGroupBy) {
  if (groupBy === 'month') {
    return period
  }
  if (groupBy === 'week') {
    return `Week of ${period}`
  }
  return period
}

export default function ProfitReport() {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState(monthStartISO())
  const [endDate, setEndDate] = useState(todayISO())
  const [category, setCategory] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentFilter>('all')
  const [groupBy, setGroupBy] = useState<ProfitGroupBy>('day')
  const enabled = !!user?.can_view_finance

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories({ ordering: 'name' }),
    enabled,
  })

  const report = useQuery({
    queryKey: ['reports', 'profit', groupBy, startDate, endDate, category, paymentMethod],
    queryFn: () => getProfitReport({
      start: startDate || undefined,
      end: endDate || undefined,
      category: category ?? undefined,
      payment_method: paymentMethod === 'all' ? undefined : paymentMethod,
      group_by: groupBy,
    }),
    enabled,
  })

  const rows = report.data?.results ?? []
  const chartRows = rows.map(row => ({
    period: periodLabel(row.period, groupBy),
    Sales: Number(row.sales),
    Profit: Number(row.profit),
  }))

  const columns: Column<ProfitReportRow>[] = [
    { key: 'period', header: 'Period', render: row => periodLabel(row.period, groupBy) },
    { key: 'count', header: 'Sales', align: 'right', render: row => row.count },
    { key: 'sales', header: 'Gross sales', align: 'right', render: row => <MoneyDisplay value={row.sales} /> },
    { key: 'profit', header: 'Profit', align: 'right', render: row => <MoneyDisplay value={row.profit} /> },
  ]

  return (
    <Layout>
      <PermissionGate minRole="MANAGER" fallback={
        <div style={page}>
          <div style={{ ...panel, padding: 22, color: 'var(--muted)', fontSize: 14 }}>Your role cannot view profit reports.</div>
        </div>
      }>
        <div style={page}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <Link to="/reports" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--primary-hover)', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 14 }}>
              <ArrowLeft size={15} />
              Reports
            </Link>

            <PageHeader
              eyebrow="Insights"
              title="Profit report"
              subtitle={report.data ? `${report.data.results.length} grouped periods` : 'Group profit by day, week, or month.'}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
              <SummaryCard label="Total profit" value={<MoneyDisplay value={report.data?.total_profit ?? 0} />} caption="Selected period" icon={<TrendingUp size={18} />} valueColor="var(--success)" />
              <SummaryCard label="Periods" value={report.data?.results.length ?? '-'} caption={`Grouped by ${groupBy}`} icon={<BarChart3 size={18} />} tone="blue" />
              <SummaryCard label="Gross sales" value={<MoneyDisplay value={rows.reduce((total, row) => total + Number(row.sales), 0)} />} caption="Across rows" icon={<ShoppingCart size={18} />} tone="amber" />
              <SummaryCard label="Sales count" value={rows.reduce((total, row) => total + row.count, 0)} caption="Across rows" icon={<ShoppingCart size={18} />} tone="neutral" />
            </div>

            <div style={{ ...panel, padding: '17px 18px', marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Profit by period</div>
              <div style={{ height: 280 }}>
                {chartRows.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartRows} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                      <XAxis dataKey="period" tick={chartAxisTick} axisLine={false} tickLine={false} />
                      <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} tickFormatter={value => compactMoney.format(Number(value))} />
                      <Tooltip formatter={moneyTooltip} contentStyle={chartTooltipStyle} />
                      <Legend iconType="circle" wrapperStyle={chartLegendStyle} />
                      <Bar dataKey="Sales" radius={[6, 6, 0, 0]} fill={CHART_COLORS.neutralFill} />
                      <Bar dataKey="Profit" radius={[6, 6, 0, 0]} fill={CHART_COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={<BarChart3 size={18} />} title="No profit data in this period." />
                )}
              </div>
            </div>

            <DirectoryCard
              title="Profit report rows"
              count={report.data ? `${rows.length} periods` : 'Loading report'}
              toolbar={(
                <DirectoryToolbar>
                  <input className="control" type="date" value={startDate} onChange={event => setStartDate(event.target.value)} style={{ padding: '0 12px' }} />
                  <input className="control" type="date" value={endDate} onChange={event => setEndDate(event.target.value)} style={{ padding: '0 12px' }} />
                  <DirectorySelect value={groupBy} onChange={value => setGroupBy(value as ProfitGroupBy)} ariaLabel="Group by">
                    <option value="day">By day</option>
                    <option value="week">By week</option>
                    <option value="month">By month</option>
                  </DirectorySelect>
                  <DirectorySelect value={category ?? 'all'} onChange={value => setCategory(value === 'all' ? null : Number(value))} ariaLabel="Category">
                    <option value="all">All categories</option>
                    {(categories.data?.results ?? []).map(row => (
                      <option key={row.id} value={row.id}>{row.name}</option>
                    ))}
                  </DirectorySelect>
                  <DirectorySelect value={paymentMethod} onChange={value => setPaymentMethod(value as PaymentFilter)} ariaLabel="Payment method">
                    <option value="all">All payments</option>
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>
                    ))}
                  </DirectorySelect>
                  <button type="button" className="primary-button" onClick={() => report.refetch()}>
                    <Filter size={16} />
                    Filter
                  </button>
                  <button type="button" className="secondary-button" onClick={() => { setStartDate(monthStartISO()); setEndDate(todayISO()); setCategory(null); setPaymentMethod('all'); setGroupBy('day') }}>
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </DirectoryToolbar>
              )}
            >
              {report.isLoading && <DirectorySkeleton />}
              {report.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(report.error)}</div>}
              {report.data && <DataTable columns={columns} rows={rows} empty={<EmptyState icon={<BarChart3 size={18} />} title="No profit rows match the current filters." />} variant="bare" />}
            </DirectoryCard>
          </div>
        </div>
      </PermissionGate>
    </Layout>
  )
}
