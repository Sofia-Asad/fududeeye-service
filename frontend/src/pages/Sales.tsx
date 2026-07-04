import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Banknote, Filter, HandCoins, Plus, ShoppingCart, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { listSales } from '@/api/sales'
import { useAuth } from '@/auth/AuthContext'
import DataTable, { type Column } from '@/components/DataTable'
import DirectoryCard, { DirectorySelect, DirectorySkeleton, DirectoryToolbar, SearchBox } from '@/components/DirectoryCard'
import EmptyState from '@/components/EmptyState'
import Layout from '@/components/Layout'
import MoneyDisplay from '@/components/MoneyDisplay'
import PageHeader from '@/components/PageHeader'
import PaginationFooter from '@/components/PaginationFooter'
import StatusBadge from '@/components/StatusBadge'
import SummaryCard from '@/components/SummaryCard'
import { errorMessage } from '@/lib/errors'
import { PAYMENT_METHOD_LABELS, PAYOUT_STATUS_LABELS, PAYOUT_STATUSES, formatDate } from '@/lib/sales'
import type { PaymentMethod, PayoutStatus, Sale } from '@/types/sales'

type PayoutFilter = 'all' | PayoutStatus
type PaymentFilter = 'all' | PaymentMethod

export default function Sales() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [payoutStatus, setPayoutStatus] = useState<PayoutFilter>('all')
  const [paymentMethod, setPaymentMethod] = useState<PaymentFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, payoutStatus, paymentMethod])

  const sales = useQuery({
    queryKey: ['sales', search, payoutStatus, paymentMethod, currentPage],
    queryFn: () => listSales({
      search: search.trim() || undefined,
      payout_status: payoutStatus === 'all' ? undefined : payoutStatus,
      payment_method: paymentMethod === 'all' ? undefined : paymentMethod,
      ordering: '-sale_date',
      page: currentPage,
    }),
  })

  const columns = useMemo<Column<Sale>[]>(() => {
    const base: Column<Sale>[] = [
      {
        key: 'id',
        header: 'Sale',
        render: sale => (
          <Link to={`/sales/${sale.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, color: 'var(--text)', textDecoration: 'none' }}>
            <span style={{ width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', color: 'var(--primary-hover)' }}>
              <ShoppingCart size={16} />
            </span>
            <span>
              <strong style={{ display: 'block', fontWeight: 700 }}>Sale #{sale.id}</strong>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(sale.sale_date)}</span>
            </span>
          </Link>
        ),
      },
      { key: 'item', header: 'Item', render: sale => <strong style={{ color: 'var(--text)' }}>{sale.item_title}</strong> },
      { key: 'buyer', header: 'Buyer', render: sale => sale.buyer_name },
      { key: 'quantity', header: 'Qty', align: 'right', render: sale => sale.quantity_sold },
      { key: 'sale_price', header: 'Amount', align: 'right', render: sale => <MoneyDisplay value={sale.sale_price} /> },
      { key: 'payment_method', header: 'Payment', render: sale => PAYMENT_METHOD_LABELS[sale.payment_method] },
    ]

    if (user?.can_view_finance) {
      base.push(
        { key: 'company_profit', header: 'Profit', align: 'right', render: sale => <span style={{ color: 'var(--success)' }}><MoneyDisplay value={sale.company_profit} /></span> },
        { key: 'payout_status', header: 'Payout', render: sale => <StatusBadge status={sale.payout_status} /> },
      )
    }

    base.push({ key: 'handled_by', header: 'Staff', render: sale => sale.handled_by_name })
    return base
  }, [user?.can_view_finance])

  const rows = sales.data?.results ?? []
  const grossOnPage = rows.reduce((total, sale) => total + Number(sale.sale_price), 0)
  const profitOnPage = rows.reduce((total, sale) => total + Number(sale.company_profit), 0)
  const pendingOnPage = rows.filter(sale => sale.payout_status === 'PENDING').length

  return (
    <Layout>
      <div className="app-page">
        <PageHeader
          eyebrow="Manage"
          title="Sales"
          subtitle="Completed sale records, payment methods, and owner payout status."
          actions={(
            <Link to="/sales/new" className="primary-button">
              <Plus size={16} />
              New sale
            </Link>
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 16 }}>
          <SummaryCard label="Sales on page" value={rows.length} caption={`${sales.data?.count ?? rows.length} total records`} icon={<ShoppingCart size={18} />} />
          <SummaryCard label="Gross on page" value={<MoneyDisplay value={grossOnPage} />} caption="Visible sale value" icon={<Banknote size={18} />} tone="blue" />
          {user?.can_view_finance && (
            <SummaryCard label="Profit on page" value={<MoneyDisplay value={profitOnPage} />} caption="Fududeeye markup" icon={<TrendingUp size={18} />} tone="amber" valueColor="var(--success)" />
          )}
          <SummaryCard label="Pending payouts" value={pendingOnPage} caption="On current page" icon={<HandCoins size={18} />} tone="red" valueColor="var(--money-owed)" />
        </div>

        <DirectoryCard
          title="Sales directory"
          count={sales.data ? `${sales.data.count} total records` : 'Loading records'}
          toolbar={(
            <DirectoryToolbar>
              <SearchBox value={search} onChange={setSearch} placeholder="Search item, buyer, notes" />
              <DirectorySelect value={payoutStatus} onChange={value => setPayoutStatus(value as PayoutFilter)} ariaLabel="Payout status">
                <option value="all">All payouts</option>
                {PAYOUT_STATUSES.map(status => (
                  <option key={status} value={status}>{PAYOUT_STATUS_LABELS[status]}</option>
                ))}
              </DirectorySelect>
              <DirectorySelect value={paymentMethod} onChange={value => setPaymentMethod(value as PaymentFilter)} ariaLabel="Payment method">
                <option value="all">All payments</option>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([method, label]) => (
                  <option key={method} value={method}>{label}</option>
                ))}
              </DirectorySelect>
              <button type="button" className="primary-button" onClick={() => setCurrentPage(1)}>
                <Filter size={16} />
                Filter
              </button>
            </DirectoryToolbar>
          )}
          footer={sales.data && (
            <PaginationFooter
              page={currentPage}
              total={sales.data.count}
              hasPrevious={!!sales.data.previous}
              hasNext={!!sales.data.next}
              onPrevious={() => setCurrentPage(page => Math.max(1, page - 1))}
              onNext={() => setCurrentPage(page => page + 1)}
            />
          )}
        >
          {sales.isLoading && <DirectorySkeleton />}
          {sales.isError && <div className="error-banner" style={{ margin: '0 18px 18px' }}>{errorMessage(sales.error)}</div>}
          {sales.data && (
            <DataTable
              columns={columns}
              rows={rows}
              variant="bare"
              empty={(
                <EmptyState
                  icon={<ShoppingCart size={18} />}
                  title="No sales found."
                  subtitle="Record your first sale or adjust the current filters."
                  action={<Link to="/sales/new" className="primary-button"><Plus size={16} />New sale</Link>}
                />
              )}
            />
          )}
        </DirectoryCard>
      </div>
    </Layout>
  )
}
