import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Banknote, Filter, RotateCcw, ShoppingCart, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { listCategories } from '@/api/inventory'
import { getSalesReport } from '@/api/reports'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar } from '@/components/DirectoryCard'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PermissionGate from '@/components/PermissionGate'
import SummaryCard from '@/components/SummaryCard'
import { formatDate, PAYMENT_METHOD_LABELS, PAYMENT_METHODS, todayISO } from '@/lib/sales'
import type { ReportSaleRow } from '@/types/reports'
import type { PaymentMethod } from '@/types/sales'

type PaymentFilter = 'all' | PaymentMethod

const page = { padding: '30px 32px 40px' } as const
const panel = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)' } as const

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

export default function SalesReport() {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState(monthStartISO())
  const [endDate, setEndDate] = useState(todayISO())
  const [category, setCategory] = useState<number | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentFilter>('all')
  const enabled = !!user?.can_view_finance

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => listCategories({ ordering: 'name' }),
    enabled,
  })

  const report = useQuery({
    queryKey: ['reports', 'sales', startDate, endDate, category, paymentMethod],
    queryFn: () => getSalesReport({
      start: startDate || undefined,
      end: endDate || undefined,
      category: category ?? undefined,
      payment_method: paymentMethod === 'all' ? undefined : paymentMethod,
    }),
    enabled,
  })

  const columns: Column<ReportSaleRow>[] = [
    {
      key: 'id',
      header: 'Sale',
      render: sale => (
        <Link to={`/sales/${sale.id}`} style={{ color: 'var(--text)', fontWeight: 800, textDecoration: 'none' }}>
          #{sale.id}
        </Link>
      ),
    },
    { key: 'item', header: 'Item', render: sale => <strong>{sale.item}</strong> },
    { key: 'buyer', header: 'Buyer', render: sale => sale.buyer },
    { key: 'quantity_sold', header: 'Qty', align: 'right', render: sale => sale.quantity_sold },
    { key: 'sale_price', header: 'Sale price', align: 'right', render: sale => <MoneyDisplay value={sale.sale_price} /> },
    { key: 'company_profit', header: 'Profit', align: 'right', render: sale => <MoneyDisplay value={sale.company_profit} /> },
    { key: 'payment_method', header: 'Payment', render: sale => PAYMENT_METHOD_LABELS[sale.payment_method] },
    { key: 'sale_date', header: 'Date', render: sale => formatDate(sale.sale_date) },
    { key: 'handled_by', header: 'Staff', render: sale => sale.handled_by },
  ]

  return (
    <Layout>
      <PermissionGate minRole="MANAGER" fallback={
        <div style={page}>
          <div style={{ ...panel, padding: 22, color: 'var(--muted)', fontSize: 14 }}>Your role cannot view sales reports.</div>
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
              title="Sales report"
              subtitle={report.data ? `${report.data.count} sales returned` : 'Filter sales by period, category, and payment method.'}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
              <SummaryCard label="Gross sales" value={<MoneyDisplay value={report.data?.gross_sales ?? 0} />} caption="Before refunds" icon={<Banknote size={18} />} />
              <SummaryCard label="Refunds" value={<MoneyDisplay value={report.data?.refunds ?? 0} />} caption="Returned value" icon={<RotateCcw size={18} />} tone="red" valueColor="var(--danger)" />
              <SummaryCard label="Net sales" value={<MoneyDisplay value={report.data?.net_sales ?? 0} />} caption="After refunds" icon={<ShoppingCart size={18} />} tone="blue" />
              <SummaryCard label="Profit" value={<MoneyDisplay value={report.data?.profit ?? 0} />} caption="Fududeeye markup" icon={<TrendingUp size={18} />} tone="primary" valueColor="var(--success)" />
              <SummaryCard label="Count" value={report.data?.count ?? '-'} caption="Sales returned" icon={<ShoppingCart size={18} />} tone="neutral" />
            </div>

            <DirectoryCard
              title="Sales report rows"
              count={report.data ? `${report.data.results.length} rows in current report` : 'Loading report'}
              toolbar={(
                <DirectoryToolbar>
                  <input className="control" type="date" value={startDate} onChange={event => setStartDate(event.target.value)} style={{ padding: '0 12px' }} />
                  <input className="control" type="date" value={endDate} onChange={event => setEndDate(event.target.value)} style={{ padding: '0 12px' }} />
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
                  <button type="button" className="secondary-button" onClick={() => { setStartDate(monthStartISO()); setEndDate(todayISO()); setCategory(null); setPaymentMethod('all') }}>
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </DirectoryToolbar>
              )}
            >
              {report.isLoading && <DirectorySkeleton />}
              {report.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(report.error)}</div>}
              {report.data && <DataTable columns={columns} rows={report.data.results} empty="No sales match the current filters." variant="bare" />}
            </DirectoryCard>
          </div>
        </div>
      </PermissionGate>
    </Layout>
  )
}
